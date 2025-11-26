import { Address } from 'viem';

// Factory contract types
export interface VaultCreatedEvent {
  vault: Address;
  owner: Address;
  heir: Address;
  inactivityPeriod: bigint;
}

export interface FactoryVaultDetails {
  owner: Address;
  heir: Address;
  inactivityPeriod: bigint;
  lastActiveTimestamp: bigint;
  executed: boolean;
  ethBalance: bigint;
  canDistribute: boolean;
}

// Vault contract types - Summary data returned as tuple/array from contract
export interface VaultSummary {
  vault: Address;
  owner: Address;
  heir: Address;
  inactivityPeriod: bigint;
  executed: boolean;
  ethBalance: bigint;
  canDistribute: boolean;
  timeUntilDistribution: bigint;
  erc20Count: bigint;
  erc721Count: bigint;
  erc1155Count: bigint;
  lastActiveTimestamp: bigint;
}

// Vault contract types
export interface AssetSummary {
  ethBalance: bigint;
  erc20Tokens: {
    token: Address;
    balance: bigint;
    decimals: number;
    symbol: string;
  }[];
  erc721Tokens: {
    collection: Address;
    tokenId: bigint;
    name: string;
    imageUrl?: string;
  }[];
  erc1155Tokens: {
    collection: Address;
    tokenId: bigint;
    balance: bigint;
    name: string;
    imageUrl?: string;
  }[];
}

export interface VaultStatus {
  isActive: boolean;
  canDistribute: boolean;
  timeUntilDistribution: bigint;
  isExecuted: boolean;
  lastActiveTimestamp: bigint;
}

// Registry contract types
export interface RegistryVaultInfo {
  owner: Address;
  heir: Address;
  active: boolean;
  registeredAt: bigint;
}

// Transaction types
export interface HeirWithPercentage {
  address: Address | ''; // Allow empty string for form input
  percentage: number; // Percentage of inheritance (0-100)
}

export interface CreateVaultParams {
  heir?: Address; // Legacy single heir support
  heirs?: HeirWithPercentage[]; // Multiple heirs with percentages
  inactivityPeriod: number;
  estimatedNFTCount?: number;
  depositAmount: string;
  depositAssets?: DepositAsset[];
}

export interface DepositAsset {
  type: 'ETH' | 'ERC20' | 'ERC721' | 'ERC1155';
  amount?: string; // For ETH and ERC20
  tokenAddress?: Address; // For ERC20, ERC721, ERC1155
  tokenId?: bigint; // For ERC721, ERC1155
  decimals?: number; // For ERC20
  name?: string; // Display name
  symbol?: string; // For ERC20
  collectionName?: string; // For NFTs
  imageUrl?: string; // For NFTs
}

export interface DepositParams {
  vaultAddress: Address;
  amount: string;
  assetType: 'ETH' | 'ERC20' | 'ERC721' | 'ERC1155';
  tokenAddress?: Address;
  tokenId?: bigint;
}

export interface UpdateVaultParams {
  vaultAddress: Address;
  heir?: Address;
  inactivityPeriod?: number;
}

// Fee calculation types
export interface CreationFeeBreakdown {
  baseFee: bigint;
  nftFee: bigint;
  totalFee: bigint;
  requiredValue: bigint;
}

// Error types
export interface ContractError {
  code: string;
  message: string;
  data?: unknown;
}

// Component props types
export interface VaultCardProps {
  vaultAddress: Address;
  showActions?: boolean;
  onDeposit?: (vaultAddress: Address) => void;
  onUpdate?: (vaultAddress: Address) => void;
  onDistribute?: (vaultAddress: Address) => void;
}

export interface CreateVaultFormProps {
  onSuccess?: (vaultAddress: Address) => void;
  onError?: (error: ContractError) => void;
}

export interface VaultManagerProps {
  userAddress?: Address;
  showCreateForm?: boolean;
}

// Hook return types
export interface UseVaultsReturn {
  vaults: Address[];
  isLoading: boolean;
  error: ContractError | null;
  refetch: () => void;
}

export interface UseVaultDetailsReturn {
  details: FactoryVaultDetails | null;
  isLoading: boolean;
  error: ContractError | null;
  refetch: () => void;
}

export interface UseCreateVaultReturn {
  createVault: (params: CreateVaultParams) => Promise<Address | null>;
  isLoading: boolean;
  error: ContractError | null;
}

export interface UseDepositReturn {
  deposit: (params: DepositParams) => Promise<boolean>;
  isLoading: boolean;
  error: ContractError | null;
}

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedVaults {
  vaults: Address[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Event types
export interface VaultEvent {
  type: 'created' | 'deposit' | 'withdrawal' | 'updated' | 'distributed';
  vault: Address;
  timestamp: bigint;
  data: unknown;
}
