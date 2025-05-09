// Define an interface for the ItxData object
export interface ItxData {
    to: string;
    amount: string;
    gasLimit: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    nonce: number;
    chainId: number;
}