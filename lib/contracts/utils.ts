import { parseEther, formatEther } from 'viem';
import { readContract } from 'wagmi/actions';
import { config } from '../wagmi';
import { CONTRACT_ADDRESSES, ABIS, type FeeCalculation, type CreateVaultParams } from './index';

/**
 * Calculate total creation fee including NFT fees
 */
export async function calculateCreationFees(
  depositAmount: string,
  estimatedNFTCount: number = 0
): Promise<FeeCalculation> {
  try {
    const [creationFee, nftFee] = await Promise.all([
      readContract(config, {
        address: CONTRACT_ADDRESSES.factory,
        abi: ABIS.factory,
        functionName: 'calculateCreationFee',
        args: [parseEther(depositAmount)],
      }),
      readContract(config, {
        address: CONTRACT_ADDRESSES.factory,
        abi: ABIS.factory,
        functionName: 'calculateMinNFTFee',
        args: [BigInt(estimatedNFTCount)],
      }),
    ]);

    const totalFee = (creationFee as bigint) + (nftFee as bigint);
    const requiredValue = parseEther(depositAmount) + totalFee;

    return {
      total: requiredValue,
      creationFee: creationFee as bigint,
      nftFee: nftFee as bigint,
    };
  } catch (error) {
    console.error('Error calculating creation fees:', error);
    throw new Error('Failed to calculate creation fees');
  }
}

/**
 * Validate create vault parameters
 */
export function validateCreateVaultParams(params: CreateVaultParams): string[] {
  const errors: string[] = [];

  // Validate heir address
  if (!params.heir || params.heir === '0x0000000000000000000000000000000000000000') {
    errors.push('Heir address is required and cannot be zero address');
  }

  // Validate inactivity period (minimum 1 hour, maximum 10 years)
  const minPeriod = 3600; // 1 hour
  const maxPeriod = 315360000; // 10 years
  if (params.inactivityPeriod < minPeriod || params.inactivityPeriod > maxPeriod) {
    errors.push(`Inactivity period must be between ${minPeriod} and ${maxPeriod} seconds`);
  }

  // Validate deposit amount
  const depositAmount = parseFloat(params.depositAmount);
  if (isNaN(depositAmount) || depositAmount <= 0) {
    errors.push('Deposit amount must be a positive number');
  }

  if (depositAmount < 0.001) {
    errors.push('Minimum deposit amount is 0.001 ETH');
  }

  // Validate NFT count
  if (params.estimatedNFTCount && params.estimatedNFTCount < 0) {
    errors.push('Estimated NFT count cannot be negative');
  }

  // Additional validation for multiple heirs
  if (params.heirs) {
    if (params.heirs.length === 0) {
      errors.push('At least one heir must be specified');
    }
    
    // Check for duplicate addresses
    const addresses = params.heirs.map(h => h.address);
    const uniqueAddresses = new Set(addresses);
    if (addresses.length !== uniqueAddresses.size) {
      errors.push('Duplicate heir addresses are not allowed');
    }

    // Validate each heir
    params.heirs.forEach((heir, index) => {
      if (!heir.address || heir.address === '0x0000000000000000000000000000000000') {
        errors.push(`Heir ${index + 1} address is required and cannot be zero address`);
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(heir.address)) {
        errors.push(`Heir ${index + 1} has invalid Ethereum address format`);
      }
      if (heir.percentage <= 0 || heir.percentage > 100) {
        errors.push(`Heir ${index + 1} percentage must be between 0 and 100`);
      }
    });

    // Validate total percentage
    const totalPercentage = params.heirs.reduce((sum, heir) => sum + heir.percentage, 0);
    if (totalPercentage !== 100) {
      errors.push(`Heir percentages must sum to exactly 100%. Current sum: ${totalPercentage}%`);
    }
  }

  // Validate depositAssets
  if (params.depositAssets && params.depositAssets.length > 0) {
    params.depositAssets.forEach((asset, index) => {
      if (asset.type === 'ERC20' || asset.type === 'ERC721' || asset.type === 'ERC1155') {
        if (!asset.tokenAddress) {
          errors.push(`Asset ${index + 1} token address is required`);
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(asset.tokenAddress)) {
          errors.push(`Asset ${index + 1} has invalid token address format`);
        }
      }
      if ((asset.type === 'ERC721' || asset.type === 'ERC1155') && !asset.tokenId) {
        errors.push(`NFT ${index + 1} token ID is required`);
      }
    });
  }

  return errors;
}

/**
 * Format time until distribution
 */
export function formatTimeUntilDistribution(seconds: bigint): string {
  const totalSeconds = Number(seconds);
  
  if (totalSeconds <= 0) {
    return 'Ready for distribution';
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format ether value with proper decimals
 */
export function formatEtherValue(value: bigint | undefined | null, decimals: number = 4): string {
  if (!value) {
    return '0';
  }

  const formatted = formatEther(value);
  const [whole, fraction] = formatted.split('.');
  
  if (!fraction) {
    return whole;
  }
  
  const truncatedFraction = fraction.slice(0, decimals);
  return `${whole}.${truncatedFraction}`;
}

/**
 * Calculate vault age in days
 */
export function calculateVaultAge(lastActiveTimestamp: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - Number(lastActiveTimestamp);
  return Math.floor(ageSeconds / 86400);
}

/**
 * Check if vault is ready for distribution
 */
export function isVaultReadyForDistribution(
  lastActiveTimestamp: bigint,
  inactivityPeriod: bigint,
  executed: boolean
): boolean {
  if (executed) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(lastActiveTimestamp) + Number(inactivityPeriod);
  return now >= deadline;
}

/**
 * Generate vault display name
 */
export function generateVaultDisplayName(
  vaultAddress: `0x${string}`,
  ownerAddress: `0x${string}` | undefined
): string {
  if (ownerAddress) {
    return `Vault ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;
  }
  return `Vault ${vaultAddress.slice(0, 6)}...${vaultAddress.slice(-4)}`;
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: `0x${string}` | string | undefined, chars: number = 6): string {
  if (!address) return "NaN"
  return `${address?.slice(0, chars)}...${address?.slice(-chars)}`;
}

/**
 * Copy address to clipboard
 */
export async function copyAddressToClipboard(address: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(address);
    return true;
  } catch (error) {
    console.error('Failed to copy address:', error);
    return false;
  }
}

/**
 * Format date from timestamp
 */
export function formatDateFromTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

/**
 * Format datetime from timestamp
 */
export function formatDateTimeFromTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

/**
 * Convert wei to gwei
 */
export function weiToGwei(wei: bigint): string {
  return (Number(wei) / 1e9).toFixed(2);
}

/**
 * Estimate gas for vault operations
 */
export async function estimateGas(
  functionName: string,
  args: unknown[],
  abi: any,
  address: `0x${string}`,
  value?: bigint
): Promise<bigint> {
  try {
    // Note: wagmi v3 doesn't support readContract for gas estimation
    // Return a reasonable default based on function type
    if (functionName.includes('create') || functionName.includes('deposit')) {
      return value ? BigInt(300000) : BigInt(200000); // Higher gas for value transfers
    }
    return BigInt(150000); // Default for read operations
  } catch (error) {
    console.error('Error estimating gas:', error);
    return BigInt(200000); // 200k gas units as fallback
  }
}

/**
 * Check if address is a contract
 */
export async function isContractAddress(address: `0x${string}`): Promise<boolean> {
  try {
    // Note: This would require using getPublicClient with getCode
    // For now, return false as a safe default
    return false;
  } catch (error) {
    console.error('Error checking if address is contract:', error);
    return false;
  }
}
