import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BaseError, parseEther, parseUnits } from 'viem';
import React, { useState, useCallback } from 'react';
import { CONTRACT_ADDRESSES, ABIS, type VaultDetails, type VaultSummary, type CreateVaultParams, type ContractError, type DepositAsset, type HeirWithPercentage } from '../lib/contracts';
import { calculateCreationFees, validateCreateVaultParams } from '../lib/contracts/utils';

// ERC20 Token ABI for balance and info queries
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC721 ABI for NFT queries
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Hook to get vaults owned by a specific address
 */
export function useVaultsByOwner(ownerAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: ABIS.factory,
    functionName: 'getVaultsByOwner',
    args: ownerAddress ? [ownerAddress] : undefined,
  });

  return {
    vaults: (ownerAddress ? (data as `0x${string}`[] || []) : []),
    isLoading: ownerAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get vault details from factory
 */
export function useVaultDetails(vaultAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: ABIS.factory,
    functionName: 'getVaultDetails',
    args: vaultAddress ? [vaultAddress] : undefined,
  });

  // Convert tuple/array response to object based on factory ABI structure
  const formatData = (data: any): VaultDetails | null => {
    if (!data) return null;
    
    // Handle both tuple/array and object responses
    if (Array.isArray(data)) {
      const dataArray = data as any[];
      // Factory getVaultDetails returns: [owner, heirs, percentages, inactivityPeriod, lastActiveTimestamp, executed, ethBalance, canDistribute]
      return {
        owner: dataArray[0], // owner
        heirs: dataArray[1] || [], // heirs array
        percentages: dataArray[2] || [], // percentages array
        heir: (dataArray[1] || [])[0] || '', // Backward compatibility: first heir as single heir
        inactivityPeriod: dataArray[3], // inactivityPeriod
        lastActiveTimestamp: dataArray[4], // lastActiveTimestamp
        executed: dataArray[5], // executed
        ethBalance: dataArray[6], // ethBalance
        canDistribute: dataArray[7], // canDistribute
      };
    }
    
    // If data is already an object, ensure all required fields exist
    return data as VaultDetails;
  };

  return {
    details: vaultAddress ? formatData(data) : null,
    isLoading: vaultAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get vault summary from vault contract
 */
export function useVaultSummary(vaultAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: vaultAddress,
    abi: ABIS.vault,
    functionName: 'getVaultSummary',
  });

  // Convert tuple/array response to object
  const formatData = (data: any): VaultSummary | null => {
    if (!data) return null;

    console.log(data);
    
    
    // Handle both tuple/array and object responses
    if (Array.isArray(data)) {
      const dataArray = data as any[];
      
      // Check if this is the unexpected response starting with vault address
      if (dataArray.length === 13 && dataArray[0]?.startsWith?.('0x') && dataArray[3]?.startsWith?.('0x')) {
        // Response format: [vault, amount, timestamp, owner, heir, inactivityPeriod, executed, ethBalance, canDistribute, timeUntilDistribution, erc20Count, erc721Count, erc1155Count, lastActiveTimestamp]
        return {
          vault: dataArray[0], // vault address
          owner: dataArray[3], // owner at index 3
          heir: dataArray[4], // heir at index 4
          inactivityPeriod: dataArray[5], // inactivityPeriod at index 5
          lastActiveTimestamp: dataArray[12], // lastActiveTimestamp at end
          executed: dataArray[6], // executed at index 6
          ethBalance: dataArray[7], // ethBalance at index 7
          canDistribute: dataArray[8], // canDistribute at index 8
          timeUntilDistribution: dataArray[11], // timeUntilDistribution at index 11
          erc20Count: dataArray[9], // erc20Count at index 9
          erc721Count: dataArray[10], // erc721Count at index 10
          erc1155Count: dataArray[11] // erc1155Count at index 11
        };
      } else {
        // This should be proper ABI response: [owner, heirs, percentages, inactivityPeriod, lastActiveTimestamp, executed, ethBalance, erc20Count, erc721Count, erc1155Count, canDistribute, timeUntilDistribution]
        return {
          vault: vaultAddress!, // Use vault address from hook params
          owner: dataArray[0], // owner
          heir: dataArray[1]?.[0] || '', // Take first heir for single heir display
          inactivityPeriod: dataArray[3], // inactivityPeriod
          lastActiveTimestamp: dataArray[4], // lastActiveTimestamp
          executed: dataArray[5], // executed
          ethBalance: dataArray[6], // ethBalance
          canDistribute: dataArray[10], // canDistribute
          timeUntilDistribution: dataArray[11], // timeUntilDistribution
          erc20Count: dataArray[7], // erc20Count
          erc721Count: dataArray[8], // erc721Count
          erc1155Count: dataArray[9] // erc1155Count
        };
      }
    }
    
    // If data is already an object, ensure all required fields exist
    return data as VaultSummary;
  };

  return {
    summary: vaultAddress ? formatData(data) : null,
    isLoading: vaultAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to create a new vault
 */
export function useCreateVault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isCreating, setIsCreating] = useState(false);

  const createVault = useCallback(async (params: CreateVaultParams) => {
    // Validate parameters
    const validationErrors = validateCreateVaultParams(params);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    // Validate heir percentages if multiple heirs are provided
    if (params.heirs && params.heirs.length > 0) {
      const totalPercentage = params.heirs.reduce((sum, heir) => sum + heir.percentage, 0);
      if (totalPercentage !== 100) {
        throw new Error(`Heir percentages must sum to 100%. Current sum: ${totalPercentage}%`);
      }
      
      if (params.heirs.some(heir => heir.percentage <= 0 || heir.percentage > 100)) {
        throw new Error('Each heir percentage must be between 0 and 100');
      }
    }

    setIsCreating(true);

    try {
      // Calculate fees
      const fees = await calculateCreationFees(
        params.depositAmount,
        params.estimatedNFTCount || 0
      );

      // Always pass arrays for heirs and percentages, even for single heir
      let heirAddresses: `0x${string}`[] = [];
      let heirPercentages: bigint[] = [];

      if (params.heirs && params.heirs.length > 0) {
        // Multiple heirs mode
        heirAddresses = params.heirs
          .filter((heir): heir is HeirWithPercentage & { address: `0x${string}` } => 
            heir.address !== '' && heir.address !== '0x0000000000000000000000000000000000000000')
          .map(heir => heir.address);
        heirPercentages = params.heirs
          .filter((heir): heir is HeirWithPercentage & { address: `0x${string}` } => 
            heir.address !== '' && heir.address !== '0x0000000000000000000000000000000000000000')
          .map(heir => BigInt(heir.percentage * 100)); // Convert to basis points (10000 = 100%)
      } else {
        // Single heir mode (backwards compatibility)
        const heirAddress = params.heir || '0x0000000000000000000000000000000000000000';
        heirAddresses = [heirAddress];
        heirPercentages = [BigInt(10000)]; // 100% = 10000 basis points
      }
      
      const args = [
        heirAddresses,
        heirPercentages,
        BigInt(params.inactivityPeriod),
        BigInt(params.estimatedNFTCount || 0)
      ] as const;

      writeContract({
        address: CONTRACT_ADDRESSES.factory,
        abi: ABIS.factory,
        functionName: 'createVault',
        args,
        value: fees.total,
      });

      return hash;
    } catch (err) {
      setIsCreating(false);
      throw err;
    }
  }, [writeContract, hash]);

  // Reset creating state when transaction is confirmed or fails
  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsCreating(false);
    }
  }, [isConfirmed, error]);

  return {
    createVault,
    isLoading: isCreating || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to deposit ETH to vault
 */
export function useDepositETH() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = useCallback(async (vaultAddress: `0x${string}`, amount: string) => {
    setIsDepositing(true);
    try {
      writeContract({
        address: vaultAddress,
        abi: ABIS.vault,
        functionName: 'depositETH',
        value: parseEther(amount),
      });
      return hash;
    } catch (err) {
      setIsDepositing(false);
      throw err;
    }
  }, [writeContract, hash]);

  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsDepositing(false);
    }
  }, [isConfirmed, error]);

  return {
    deposit,
    isLoading: isDepositing || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to deposit ERC20 tokens to vault
 */
export function useDepositERC20() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = useCallback(async (
    vaultAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number = 18
  ) => {
    setIsDepositing(true);
    try {
      writeContract({
        address: vaultAddress,
        abi: ABIS.vault,
        functionName: 'depositERC20',
        args: [tokenAddress, parseUnits(amount, decimals)],
      });
      return hash;
    } catch (err) {
      setIsDepositing(false);
      throw err;
    }
  }, [writeContract, hash]);

  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsDepositing(false);
    }
  }, [isConfirmed, error]);

  return {
    deposit,
    isLoading: isDepositing || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to deposit ERC721 NFT to vault
 */
export function useDepositERC721() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = useCallback(async (
    vaultAddress: `0x${string}`,
    collectionAddress: `0x${string}`,
    tokenId: string
  ) => {
    setIsDepositing(true);
    try {
      writeContract({
        address: vaultAddress,
        abi: ABIS.vault,
        functionName: 'depositERC721',
        args: [collectionAddress, BigInt(tokenId)],
      });
      return hash;
    } catch (err) {
      setIsDepositing(false);
      throw err;
    }
  }, [writeContract, hash]);

  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsDepositing(false);
    }
  }, [isConfirmed, error]);

  return {
    deposit,
    isLoading: isDepositing || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to update vault activity
 */
export function useUpdateActivity() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isUpdating, setIsUpdating] = useState(false);

  const updateActivity = useCallback(async (vaultAddress: `0x${string}`) => {
    setIsUpdating(true);
    try {
      writeContract({
        address: vaultAddress,
        abi: ABIS.vault,
        functionName: 'updateActivity',
      });
      return hash;
    } catch (err) {
      setIsUpdating(false);
      throw err;
    }
  }, [writeContract, hash]);

  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsUpdating(false);
    }
  }, [isConfirmed, error]);

  return {
    updateActivity,
    isLoading: isUpdating || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to update vault heir
 */
export function useUpdateHeir() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const [isUpdating, setIsUpdating] = useState(false);

  const updateHeir = useCallback(async (vaultAddress: `0x${string}`, newHeir: `0x${string}`) => {
    setIsUpdating(true);
    try {
      // Using setHeirs function with arrays - even for single heir
      writeContract({
        address: vaultAddress,
        abi: ABIS.vault,
        functionName: 'setHeirs',
        args: [[newHeir], [BigInt(10000)]], // 100% = 10000 basis points
      });
      return hash;
    } catch (err) {
      setIsUpdating(false);
      throw err;
    }
  }, [writeContract, hash]);

  React.useEffect(() => {
    if (isConfirmed || error) {
      setIsUpdating(false);
    }
  }, [isConfirmed, error]);

  return {
    updateHeir,
    isLoading: isUpdating || isPending || isConfirming,
    isConfirmed,
    hash,
    error: error as ContractError | null,
  };
}

/**
 * Hook to check if vault can distribute
 */
export function useCanDistribute(vaultAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: vaultAddress,
    abi: ABIS.vault,
    functionName: 'canDistribute',
  });

  return {
    canDistribute: vaultAddress ? (data as boolean || false) : false,
    isLoading: vaultAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get time until distribution
 */
export function useTimeUntilDistribution(vaultAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: vaultAddress,
    abi: ABIS.vault,
    functionName: 'timeUntilDistribution',
  });

  return {
    timeUntilDistribution: vaultAddress ? (data as bigint || BigInt(0)) : BigInt(0),
    isLoading: vaultAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get distributable vaults from registry
 */
export function useDistributableVaults() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: ABIS.registry,
    functionName: 'getDistributableVaults',
  });

  return {
    vaults: data as `0x${string}`[] || [],
    isLoading,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get ERC20 tokens from user's wallet
 */
export function useWalletERC20Tokens(address?: `0x${string}`, tokenAddresses?: `0x${string}`[]) {
  const [tokens, setTokens] = useState<DepositAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ContractError | null>(null);

  React.useEffect(() => {
    if (!address || !tokenAddresses?.length) {
      setTokens([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchTokens = async () => {
      try {
        // For now, return empty array until API is implemented
        // In production, this would query the blockchain for ERC20 token balances
        const tokenPromises = tokenAddresses.map(async (tokenAddress) => ({
          type: 'ERC20' as const,
          tokenAddress,
          amount: '0',
          decimals: 18,
          symbol: 'TOKEN',
          name: 'Token',
        }));

        const fetchedTokens = await Promise.all(tokenPromises);
        setTokens(fetchedTokens.filter(token => BigInt(token.amount || 0) > 0));
      } catch (err) {
        setError(err as ContractError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [address, tokenAddresses]);

  return { tokens, isLoading, error, refetch: () => {} };
}

/**
 * Hook to get ERC721 NFTs from user's wallet
 */
export function useWalletERC721NFTs(address?: `0x${string}`, collectionAddresses?: `0x${string}`[]) {
  const [nfts, setNfts] = useState<DepositAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ContractError | null>(null);

  React.useEffect(() => {
    if (!address || !collectionAddresses?.length) {
      setNfts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchNFTs = async () => {
      try {
        // For now, return empty array until API is implemented
        // In production, this would query the blockchain for NFTs
        const nftPromises = collectionAddresses.map(async (collectionAddress) => ({
          type: 'ERC721' as const,
          tokenAddress: collectionAddress,
          tokenId: BigInt(1),
          name: 'Sample NFT',
          collectionName: 'Sample Collection',
          imageUrl: '',
        }));

        const allNFTs = (await Promise.all(nftPromises)).flat();
        setNfts(allNFTs);
      } catch (err) {
        setError(err as ContractError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, collectionAddresses]);

  return { nfts, isLoading, error, refetch: () => {} };
}

/**
 * Hook to get all wallet assets (ETH, ERC20, ERC721)
 */
export function useWalletAssets(address?: `0x${string}`) {
  // For now, return empty arrays until APIs are implemented
  const tokens: DepositAsset[] = [];
  const nfts: DepositAsset[] = [];

  // Get ETH balance from useBalance hook would be ideal
  const ethAsset: DepositAsset = {
    type: 'ETH',
    amount: '0',
  };

  return {
    assets: [ethAsset, ...tokens, ...nfts],
    isLoading: false,
    error: null,
  };
}
