import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS, type ContractError } from '../lib/contracts';

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
 * Hook to get vault info from registry
 */
export function useVaultInfo(vaultAddress?: `0x${string}`) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: ABIS.registry,
    functionName: 'getVaultInfo',
    args: vaultAddress ? [vaultAddress] : undefined,
  });

  // Convert tuple/array response to object based on registry ABI structure
  const formatData = (data: any): { vaultOwner: `0x${string}`; active: boolean } | null => {
    if (!data) return null;
    
    // Handle both tuple/array and object responses
    if (Array.isArray(data)) {
      const dataArray = data as any[];
      // Registry getVaultInfo returns: [vaultOwner, active]
      return {
        vaultOwner: dataArray[0], // vaultOwner
        active: dataArray[1], // active
      };
    }
    
    // If data is already an object, ensure all required fields exist
    return data as { vaultOwner: `0x${string}`; active: boolean };
  };

  return {
    info: vaultAddress ? formatData(data) : null,
    isLoading: vaultAddress ? isLoading : false,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get total vaults from registry
 */
export function useTotalVaults() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: ABIS.registry,
    functionName: 'getTotalVaults',
  });

  return {
    total: data as bigint || BigInt(0),
    isLoading,
    error: error as ContractError | null,
    refetch,
  };
}

/**
 * Hook to get registry statistics
 */
export function useRegistryStats() {
  const { total } = useTotalVaults();
  const { vaults: distributable } = useDistributableVaults();

  return {
    totalVaults: total,
    distributableVaults: distributable.length,
    registryAddress: CONTRACT_ADDRESSES.registry,
  };
}
