import FACTORY_ABI from '../abi/NatecinFactory.json';
import VAULT_ABI from '../abi/NatecinVault.json';
import REGISTRY_ABI from '../abi/VaultRegistry.json';

// Contract addresses - Deployed on Lisk Sepolia
export const CONTRACT_ADDRESSES = {
  factory: "0xdD0892634DA8aade4621d1d91A50552028E80D8F", // NatecinFactory
  registry: "0xdD154C99638e7DDEe610E4b54a154cAf7B15FFCE", // VaultRegistry
} as const;

export const ABIS = {
  factory: FACTORY_ABI.abi,
  vault: VAULT_ABI.abi,
  registry: REGISTRY_ABI.abi,
} as const;

// Type exports for better TypeScript support
export type FactoryABI = typeof ABIS.factory;
export type VaultABI = typeof ABIS.vault;
export type RegistryABI = typeof ABIS.registry;

// Re-export types from types.ts for easier imports
export type { 
  CreateVaultParams,
  HeirWithPercentage,
  DepositAsset,
  ContractError
} from './types';

// Contract type definitions
export interface VaultDetails {
  owner: `0x${string}`;
  heirs: `0x${string}`[];
  percentages: bigint[];
  heir: `0x${string}`; // Backward compatibility: first heir
  inactivityPeriod: bigint;
  lastActiveTimestamp: bigint;
  executed: boolean;
  ethBalance: bigint;
  canDistribute: boolean;
}

export interface VaultSummary {
  vault: `0x${string}`;
  owner: `0x${string}`;
  heir: `0x${string}`;
  inactivityPeriod: bigint;
  lastActiveTimestamp: bigint;
  executed: boolean;
  ethBalance: bigint;
  erc20Count: number;
  erc721Count: number;
  erc1155Count: number;
  canDistribute: boolean;
  timeUntilDistribution: bigint;
}

export interface VaultInfo {
  owner: `0x${string}`;
  heir: `0x${string}`;
  active: boolean;
}

export interface FeeCalculation {
  total: bigint;
  creationFee: bigint;
  nftFee: bigint;
}

// Default values
export const DEFAULT_INACTIVITY_PERIOD = 86400; // 24 hours in seconds
export const MIN_VAULT_DEPOSIT = "0.01"; // ETH
