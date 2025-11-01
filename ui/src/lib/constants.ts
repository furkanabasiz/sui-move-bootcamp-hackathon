// Replace with your deployed package ID
export const PACKAGE_ID = '0x...';
export const PLATFORM_CONFIG_ID = '0x...';

export const NETWORK = 'testnet'; // or 'mainnet', 'devnet'

export const SUI_NETWORK_CONFIG = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  devnet: 'https://fullnode.devnet.sui.io:443',
};

export const EXPLORER_URL = {
  testnet: 'https://suiscan.xyz/testnet',
  mainnet: 'https://suiscan.xyz/mainnet',
  devnet: 'https://suiscan.xyz/devnet',
};

export const MAX_OPTIONS = 10;
export const MIN_OPTIONS = 2;
export const MAX_QUESTION_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_OPTION_LENGTH = 100;