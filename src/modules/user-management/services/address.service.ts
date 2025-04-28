import { ethers } from "ethers";
import crypto from "crypto";
require("dotenv").config();

const MASTER_MNEMONIC =
  process.env.MASTER_MNEMONIC ||
  "test test test test test test test test test test test junk";

// Create the master HD node
const masterNode = ethers.HDNodeWallet.fromPhrase(MASTER_MNEMONIC);

// Wallet derivation path - BIP44 standard (without the m/ prefix)
const getDerivationPath = (userId: string) => {
  const hash = crypto.createHash("sha256").update(userId).digest("hex");
  const accountIndex = parseInt(hash.substring(0, 3), 16) % 1000;

  const relativePath = `44'/60'/${accountIndex}'/0/0`;
  console.log(
    `Generated derivation path for userId ${userId}: m/${relativePath}`
  );

  return relativePath;
};

export const generateWalletForUser = async (
  userId: string
): Promise<{
  address: string;
  publicKey: string;
  path: string;
}> => {
  const relativePath = getDerivationPath(userId);
  const wallet = masterNode.derivePath(relativePath);

  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    path: `m/${relativePath}`,
  };
};

// method used to signing a transaction
export const signTransaction = (userId: string, txData: any) => {
  const relativePath = getDerivationPath(userId);
  const wallet = masterNode.derivePath(relativePath);

  // Create and sign transaction
  const tx = {
    to: txData.to,
    value: ethers.parseEther(txData.amount),
    gasLimit: txData.gasLimit || "21000",
    maxFeePerGas: txData.maxFeePerGas || ethers.parseUnits("20", "gwei"),
    maxPriorityFeePerGas:
      txData.maxPriorityFeePerGas || ethers.parseUnits("1", "gwei"),
    nonce: txData.nonce,
    chainId: txData.chainId || 11155111, // ETH Sepolia testnet
  };

  return wallet.signTransaction(tx);
};
