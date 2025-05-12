import dotenv from "dotenv";

// Determine the environment and load the corresponding file
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config();

export const getEnvironmentVariable = (
	key: string,
	defaultVal?: string
): string => {
	const value = process.env[key] || defaultVal;
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is undefined`);
	}
	return value;
};

export const getEnvironmentVariableNumber = (
	key: string,
	defaultVal?: number
): number => {
	const value = process.env[key] || defaultVal;
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is undefined`);
	}
	return Number(value);
};

export const MONGO_URI = getEnvironmentVariable("MONGO_URI");
export const PORT = getEnvironmentVariableNumber("PORT", 5001);
export const JWT_SECRET = getEnvironmentVariable("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnvironmentVariable("JWT_REFRESH_SECRET");
export const NODE_ENV = getEnvironmentVariable("NODE_ENV", "development");
export const MASTER_MNEMONIC = getEnvironmentVariable(
	"MASTER_MNEMONIC",
	"test test test test test test test test test test test junk"
);
export const USDC_CONTRACT_ADDRESS = getEnvironmentVariable("USDC_CONTRACT_ADDRESS");
export const GBESE_CONTRACT_ADDRESS = getEnvironmentVariable("GBESE_CONTRACT_ADDRESS");
export const BASE_TESTNET_RPC_URL = getEnvironmentVariable( "BASE_TESTNET_RPC_URL");
export const DEFAULT_GAS_FUNDER_PRIVATE_KEY = getEnvironmentVariable("DEFAULT_GAS_FUNDER_PRIVATE_KEY");

// Redis variables for notifications
export const REDIS_USERNAME = getEnvironmentVariable("REDIS_USERNAME");
export const REDIS_PASSWORD = getEnvironmentVariable("REDIS_PASSWORD");
export const REDIS_HOST = getEnvironmentVariable("REDIS_HOST");
export const REDIS_PORT = getEnvironmentVariableNumber("REDIS_PORT");
export const GMAIL_APP_EMAIL = getEnvironmentVariable("GMAIL_APP_EMAIL");
export const GMAIL_APP_PASSWORD = getEnvironmentVariable("GMAIL_APP_PASSWORD");

// Loan constants
export const MAX_LOAN_LIMIT = 1000000 // 1 million
export const INITIAL_LOAN_LIMIT = 10000 // 10 thousand
export const LOAN_INTEREST = 0.05 // 5% interest rate
export const CREDIT_SCORE_REDUCTION = 0.1 // 10% Every failed day
export const NEW_USER_CREDIT_SCORE = 10 // credit score for every initial loan amount

// ERC20 ABI - only methods we need
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];
