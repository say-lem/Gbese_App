import { ethers } from "ethers";
import crypto from "crypto";
import {
  MASTER_MNEMONIC,
  BASE_TESTNET_RPC_URL,
  USDC_CONTRACT_ADDRESS,
  ERC20_ABI,
  DEFAULT_GAS_FUNDER_PRIVATE_KEY,
  GBESE_CONTRACT_ADDRESS,
} from "../../../config/constants";
import { ItxData } from "../../../common/interfaces/TxData";
import { UserModel } from "../../user-management/Models/user.model";
import { cryptoTransactionModel } from "../models/cryptoTransaction.model";
import { WalletModel } from "../../wallet-management/models/wallet.model";

// Define the interface for the USDC contract
interface ERC20 extends ethers.BaseContract {
  balanceOf(owner: string): Promise<bigint>;
  transfer(
    to: string,
    amount: bigint
  ): Promise<ethers.ContractTransactionResponse>;
  decimals(): Promise<number>;
  symbol(): Promise<string>;
  name(): Promise<string>;
}

// Create the master HD node
const masterNode = ethers.HDNodeWallet.fromPhrase(MASTER_MNEMONIC);

// Connect to Base testnet
const provider = new ethers.JsonRpcProvider(BASE_TESTNET_RPC_URL);

// Initialize USDC contract interface
const usdcContract = new ethers.Contract(
  USDC_CONTRACT_ADDRESS,
  ERC20_ABI,
  provider
) as unknown as ERC20;

// Initialize USDC contract interface
const gbeseContract = new ethers.Contract(
  GBESE_CONTRACT_ADDRESS,
  ERC20_ABI,
  provider
) as unknown as ERC20;

// Default transaction data structure
const defaultTxData: ItxData = {
  to: "",
  amount: "",
  gasLimit: "21000",
  maxFeePerGas: ethers.parseUnits("20", "gwei").toString(),
  maxPriorityFeePerGas: ethers.parseUnits("1", "gwei").toString(),
  nonce: 0,
  chainId: 84532, // Base Sepolia testnet chainId
};

export class CryptoTransactionService {
  // Generate a derivation path for a user based on their userId
  static getDerivationPath = async (userId: string): Promise<string> => {
    const hash = crypto.createHash("sha256").update(userId).digest("hex");
    const accountIndex = parseInt(hash.substring(0, 3), 16) % 1000;

    const relativePath = `44'/60'/${accountIndex}'/0/0`;
    console.log(
      `Generated derivation path for userId ${userId}: m/${relativePath}`
    );

    return relativePath;
  };

  //  Generates a wallet for a user based on their userId

  static generateWalletForUser = async (
    userId: string
  ): Promise<{
    address: string;
    publicKey: string;
    path: string;
  }> => {
    const relativePath = await this.getDerivationPath(userId);
    const wallet = masterNode.derivePath(relativePath);

    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      path: `m/${relativePath}`,
    };
  };

  // gets the USDC balance of a user
  static getUSDCBalance = async (userId: string): Promise<string> => {
    const user = await UserModel.findById(userId);

    if (!user || !user.walletAddress) {
      throw new Error(`No wallet found for user ${userId}`);
    }

    const balance = await usdcContract.balanceOf(user.walletAddress);
    const decimals = await usdcContract.decimals();

    // Update the user's USDC balance in the database
    await UserModel.findByIdAndUpdate(userId, {
      usdcBalance: ethers.formatUnits(balance, decimals),
    });

    return ethers.formatUnits(balance, decimals);
  };

  // Makes an internal system transfer (not on-chain)
  static InternalTransfer = async (
    fromUserName: string,
    toUserName: string,
    amount: string,
    currency: string,
    transactionType: string
  ): Promise<string> => {    
    // Validate users exist
    const [fromUser, toUser] = await Promise.all([
      UserModel.findOne({ username: fromUserName }),
      UserModel.findOne({ username: toUserName }),
    ]);

    if (!toUser) {
      throw new Error("User do not exist");
    }

    const numAmount = parseFloat(amount);

    // Check if user has sufficient balance
    if (currency === "USDC" && (fromUser?.usdcBalance || 0) < numAmount) {
      throw new Error("Insufficient USDC balance");
    } else if (currency === "ETH" && (fromUser?.ethBalance || 0) < numAmount) {
      throw new Error("Insufficient ETH balance");
    } else if (
      currency === "GBESE" &&
      (fromUser?.gbeseTokenBalance || 0) < numAmount
    ) {
      throw new Error("Insufficient GBESE token balance");
    }

    // Create transaction record
    const transaction = new cryptoTransactionModel({
      fromUserName,
      toUserName,
      amount: numAmount,
      status: "CONFIRMED", // System transfers are instant
      currency,
      Direction: "INTERNAL",
      TransactionType: transactionType,
    });
    await transaction.save();

    // Update user balances
    await this.updateUserBalances(fromUserName, toUserName, amount, currency);

    return transaction._id.toString();
  };

  // Transfers USDC to an external address (on-chain)
  static externalTransfer = async (
    fromUserId: string,
    fromUserName: string,
    toAddress: string,
    amount: string,
    currency: string
  ): Promise<string> => {
    const GAS_THRESHOLD = ethers.parseEther("0.0002");
    const GAS_TOPUP_AMOUNT = ethers.parseEther("0.0001");

    const fromUser = await UserModel.findOne({ username: fromUserName });

    if (!fromUser?.walletAddress) {
      throw new Error("User does not have a wallet");
    }

    const relativePath = await this.getDerivationPath(fromUserId);
    const wallet = masterNode.derivePath(relativePath);
    const walletWithProvider = new ethers.Wallet(wallet.privateKey, provider);

    // Check ETH balance for gas
    const ethBalance = await provider.getBalance(walletWithProvider.address);

    if (ethBalance < GAS_THRESHOLD) {
      console.log(
        `Funding gas for user ${fromUserName} from sponsor wallet...`
      );

      const gasFunder = new ethers.Wallet(
        DEFAULT_GAS_FUNDER_PRIVATE_KEY!,
        provider
      );
      const tx = await gasFunder.sendTransaction({
        to: walletWithProvider.address,
        value: GAS_TOPUP_AMOUNT,
      });

      await tx.wait();
      console.log(`Gas funded with tx: ${tx.hash}`);
    }
    
    const usdcWithSigner = usdcContract.connect(walletWithProvider) as ERC20;
    const balance = await usdcContract.balanceOf(walletWithProvider.address);
    const decimals = await usdcContract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    if (balance < parsedAmount) {
      throw new Error("Insufficient USDC balance");
    }

    const transaction = new cryptoTransactionModel({
      fromUserName,
      toUserName: "null",
      fromAddress: walletWithProvider.address,
      toAddress,
      amount: parseFloat(amount),
      status: "PENDING",
      currency,
      Direction: "EXTERNAL",
      TransactionType: "WITHDRAWAL",
    });
    await transaction.save();

    try {
      const tx = await usdcWithSigner.transfer(toAddress, parsedAmount);

      transaction.txHash = tx.hash;
      await transaction.save();

      const receipt = await tx.wait();
      transaction.status = "CONFIRMED";
      await transaction.save();

      await this.updateUserBalance(fromUserName, amount, currency, "subtract");

      return tx.hash;
    } catch (error) {
      transaction.status = "FAILED";
      await transaction.save();
      throw error;
    }
  };

  // GBESE TOKEN DISBURSEMENT FOR LOAN PAYOUTS
  static gbeseTokenRewards = async (
    toAddress: string,
    amount?: string,
    currency?: string
  ): Promise<string> => {
    amount = amount || "5";
    currency = "GBESE";

    if (!toAddress) {
      throw new Error("No Wallet Found");
    }

    const walletWithProvider = new ethers.Wallet(
      DEFAULT_GAS_FUNDER_PRIVATE_KEY!,
      provider
    );

    const gbeseWithSigner = gbeseContract.connect(walletWithProvider) as ERC20;
    const balance = await gbeseContract.balanceOf(walletWithProvider.address);
    const decimals = await gbeseContract.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    if (balance < parsedAmount) {
      throw new Error("Insufficient GBESE balance");
    }

    const transaction = new cryptoTransactionModel({
      fromAddress: walletWithProvider.address,
      toAddress,
      toUserName: "null",
      amount: parseFloat(amount),
      status: "PENDING",
      currency,
      Direction: "INTERNAL",
      TransactionType: "REWARD",
    });
    await transaction.save();

    try {
      const tx = await gbeseWithSigner.transfer(toAddress, parsedAmount);

      transaction.txHash = tx.hash;
      await transaction.save();

      const receipt = await tx.wait();
      transaction.status = "CONFIRMED";
      await transaction.save();

      // update users balance
      await UserModel.findOneAndUpdate(
        { walletAddress: toAddress },
        {
          $inc: { gbeseTokenBalance: parseFloat(amount) },
        },
        { new: true }
      );

      return tx.hash;
    } catch (error) {
      transaction.status = "FAILED";
      await transaction.save();
      throw error;
    }
  };

  //  Updates balances for users involved in a transaction
  static updateUserBalances = async (
    fromUserName: string,
    toUserName: string,
    amount: string,
    currency: string
  ): Promise<void> => {
    const numAmount = parseFloat(amount);

    // Update sender's balance (subtract)
    await this.updateUserBalance(fromUserName, amount, currency, "subtract");

    // Update recipient's balance (add)
    await this.updateUserBalance(toUserName, amount, currency, "add");
  };

  //  Updates a user's balance
  static updateUserBalance = async (
    userName: string,
    amount: string,
    currency: string,
    operation: "add" | "subtract"
  ): Promise<void> => {
    const numAmount = parseFloat(amount);
    const multiplier = operation === "add" ? 1 : -1;

    if (currency === "USDC") {
      await UserModel.findOneAndUpdate(
        { username: userName },
        {
          $inc: { usdcBalance: numAmount * multiplier },
        },
        { new: true }
      );
    } else if (currency === "ETH") {
      await UserModel.findOneAndUpdate(
        { username: userName },
        {
          $inc: { ethBalance: numAmount * multiplier },
        },
        { new: true }
      );
    } else if (currency === "GBESE") {
      await UserModel.findOneAndUpdate(
        { username: userName },
        {
          $inc: { gbeseTokenBalance: numAmount * multiplier },
        },
        { new: true }
      );
    }    

    // Also update the wallet's tokenUSDBalance
    // check this for eth and gbese
    if (currency === "USDC") {
     const wallet = await WalletModel.findOneAndUpdate(
        { username: userName },
        { $inc: { tokenUSDBalance: numAmount * multiplier } },
        { new: true }
      );
      console.log("wallet:", wallet?.tokenUSDBalance);
    }
  };

  //  Gets a user's token balances
  static getUserWalletBalance = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      usdcBalance: user.usdcBalance || 0,
      ethBalance: user.ethBalance || 0,
      gbeseTokenBalance: user.gbeseTokenBalance || 0,
    };
  };

  //  Gets transaction history for a user
  static getUserTransactionHistory = async (userName: string) => {
    return await cryptoTransactionModel
      .find({
        $or: [{ fromUserName: userName }, { toUserName: userName }],
        isDeleted: false,
      })
      .sort({ timestamp: -1 });
  };

  // Gets all transactions for a specific currency
  static getTransactionsByCurrency = async (
    currency: string,
    userId: string
  ) => {
    return await cryptoTransactionModel
      .find({
        currency,
        $or: [{ fromUserId: userId }, { toUserId: userId }],
        isDeleted: false,
      })
      .sort({ timestamp: -1 });
  };

  // Marks a transaction as deleted (soft delete)
  static deleteTransaction = async (transactionId: string): Promise<void> => {
    await cryptoTransactionModel.findByIdAndUpdate(transactionId, {
      isDeleted: true,
    });
  };

  // Listens for USDC transactions and updates user balances accordingly
  static startTransactionListener = async (): Promise<void> => {
    console.log("Starting transaction listener for USDC and GBESE...");
  
    const usdcDecimals = await usdcContract.decimals();
    const gbeseDecimals = await gbeseContract.decimals();
  
    const users = await UserModel.find(
      { walletAddress: { $exists: true, $ne: null } },
      { _id: 1, walletAddress: 1, username: 1 }
    );
  
    const userAddresses = new Set(users.map((u) => u.walletAddress.toLowerCase()));
    const addressToUserId = Object.fromEntries(
      users.map((u) => [u.walletAddress.toLowerCase(), u._id.toString()])
    );
    const addressToUserName = Object.fromEntries(
      users.map((u) => [u.walletAddress.toLowerCase(), u.username])
    );    
  
    provider.on("block", async (blockNumber: number) => {
      try {
        // 👇 Prepare filters for both contracts
        const filters = [
          {
            name: "USDC",
            address: USDC_CONTRACT_ADDRESS,
            contract: usdcContract,
            decimals: usdcDecimals,
            currency: "USDC",
          },
          {
            name: "GBESE",
            address: GBESE_CONTRACT_ADDRESS,
            contract: gbeseContract,
            decimals: gbeseDecimals,
            currency: "GBESE",
          },
        ];
  
        for (const { name, address, contract, decimals, currency } of filters) {
          const logs = await provider.getLogs({
            fromBlock: blockNumber,
            toBlock: blockNumber,
            address,
            topics: [ethers.id("Transfer(address,address,uint256)")],
          });
  
          for (const log of logs) {
            const parsed = contract.interface.parseLog(log);
            const from = parsed!.args.from.toLowerCase();
            const to = parsed!.args.to.toLowerCase();
            const value = parsed!.args.value;
  
            if (userAddresses.has(to)) {
              const userId = addressToUserId[to];
              const userName = addressToUserName[to];
              console.log("userName:", userName);
              

              const amount = ethers.formatUnits(value, decimals);
              const isInternal = userAddresses.has(from);
  
              if (!isInternal) {
                const txHash = log.transactionHash;
  
                console.log(`Received ${amount} ${currency} for user ${userId} in tx ${txHash}`);
  
                const transaction = new cryptoTransactionModel({
                  toUserId: userId,
                  fromAddress: from,
                  toAddress: to,
                  toUserName: userName,
                  amount: parseFloat(amount),
                  txHash,
                  status: "CONFIRMED",
                  currency,
                  Direction: "EXTERNAL",
                  TransactionType: "DEPOSIT",
                });
                await transaction.save();
  
                await this.updateUserBalance(userName, amount, currency, "add");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing token transfer logs:", error);
      }
    });
  
    console.log("Transaction listener for USDC and GBESE started");
  };
  
}
