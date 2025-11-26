'use client';

import React, { useState, useEffect } from 'react';
import { useConnection } from 'wagmi';
import { Address } from 'viem';
import { Shield, Clock, Users, Vault, Heart, Zap, AlertCircle, Plus, X, Image, Coins } from 'lucide-react';
import { useCreateVault, useWalletAssets } from '../../hooks/useVaults';
import { calculateCreationFees, formatEtherValue } from '../../lib/contracts/utils';
import { DEFAULT_INACTIVITY_PERIOD, type CreateVaultParams, type FeeCalculation, type HeirWithPercentage, type DepositAsset } from '../../lib/contracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedIcon, AnimatedShield, AnimatedHeartbeat, AnimatedVaultIcon } from '@/components/ui/AnimatedIcon';
import { NFTSelector } from './NFTSelector';
import { TokenSelector } from './TokenSelector';
import { motion } from 'framer-motion';

interface CreateVaultFormProps {
  onSuccess?: (vaultAddress: string) => void;
  onError?: (error: Error) => void;
}

export function CreateVaultForm({ onSuccess, onError }: CreateVaultFormProps) {
  const [mounted, setMounted] = useState(false);
  const connection = useConnection();
  const address = connection.address;

  useEffect(() => {
    setMounted(true);
  }, []);
  const { createVault, isLoading, isConfirmed, error } = useCreateVault();
  const { assets, isLoading: isLoadingAssets } = useWalletAssets(address);
  
  // Form state with support for multiple heirs and assets
  const [formData, setFormData] = useState<{
    heirs: HeirWithPercentage[];
    inactivityPeriod: number;
    estimatedNFTCount: number;
    depositAmount: string;
    selectedAssets: DepositAsset[];
    useMultipleHeirs: boolean;
  }>({
    heirs: [{ address: '', percentage: 100 }],
    inactivityPeriod: DEFAULT_INACTIVITY_PERIOD,
    estimatedNFTCount: 0,
    depositAmount: '0.1',
    selectedAssets: [],
    useMultipleHeirs: false,
  });

  const [feeBreakdown, setFeeBreakdown] = useState<FeeCalculation | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Add new heir
  const addHeir = () => {
    const remainingPercentage = 100 - (formData.heirs || []).reduce((sum, heir) => sum + heir.percentage, 0);
    if (remainingPercentage > 0 && formData.heirs.length < 10) {
      setFormData(prev => ({
        ...prev,
        heirs: [...(prev.heirs || []), { address: '', percentage: Math.min(remainingPercentage, 50) }],
      }));

      console.log(formData);
      
    }
  };

  // Remove heir
  const removeHeir = (index: number) => {
    const currentHeirs = formData.heirs || [];
    if (currentHeirs.length > 1) {
      const newHeirs = currentHeirs.filter((_, i) => i !== index);
      // Redistribute percentages evenly
      const evenSplit = Math.floor(100 / newHeirs.length);
      const remainder = 100 - (evenSplit * newHeirs.length);
      
      newHeirs.forEach((heir, i) => {
        heir.percentage = evenSplit + (i < remainder ? 1 : 0);
      });
      
      setFormData(prev => ({
        ...prev,
        heirs: newHeirs,
      }));
    }
  };

  // Update heir address or percentage
  const updateHeir = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const currentHeirs = formData.heirs || [];
    const newHeirs = [...currentHeirs];
    
    if (field === 'address') {
      newHeirs[index].address = value as Address | '';
    } else {
      const newPercentage = Number(value);
      const oldPercentage = newHeirs[index].percentage;
      const diff = newPercentage - oldPercentage;
      
      // Adjust other heirs to maintain 100% total
      if (diff !== 0 && newHeirs.length > 1) {
        const otherHeirs = newHeirs.filter((_, i) => i !== index);
        const adjustment = Math.floor(-diff / otherHeirs.length);
        
        otherHeirs.forEach((heir, i) => {
          if (i < -diff % otherHeirs.length) {
            heir.percentage += adjustment + 1;
          } else {
            heir.percentage += adjustment;
          }
        });
      }
      
      newHeirs[index].percentage = newPercentage;
    }
    
    setFormData(prev => ({
      ...prev,
      heirs: newHeirs,
    }));
  };

  // Add/remove asset
  const toggleAssetSelection = (newAsset: DepositAsset) => {
    setFormData(prev => {
      const updatedAssets = prev.selectedAssets.some(selected => 
        selected.type === newAsset.type && 
        selected.tokenAddress === newAsset.tokenAddress && 
        selected.tokenId === newAsset.tokenId
      )
        ? prev.selectedAssets.filter(selected => 
            !(selected.type === newAsset.type && 
              selected.tokenAddress === newAsset.tokenAddress && 
              selected.tokenId === newAsset.tokenId)
          )
        : [...prev.selectedAssets, newAsset];
      
      // Update estimated NFT count when NFTs are selected
      const nftCount = updatedAssets.filter(item => item.type === 'ERC721' || item.type === 'ERC1155').length;
      
      return {
        ...prev,
        selectedAssets: updatedAssets,
        estimatedNFTCount: nftCount,
      };
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field as string]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Recalculate fees when relevant fields change
    if (field === 'depositAmount' || field === 'estimatedNFTCount') {
      calculateFees();
    }
  };

  const validateField = (field: string, value: string | number | DepositAsset[] | HeirWithPercentage[] | boolean, userAddress?: Address) => {
    switch (field) {
      case 'heirs':
        const totalPercentage = (value as HeirWithPercentage[]).reduce((sum, heir) => sum + heir.percentage, 0);
        if (totalPercentage !== 100) {
          return `Heir percentages must sum to 100% (currently ${totalPercentage}%)`;
        }
        if ((value as HeirWithPercentage[]).some(heir => !heir.address || heir.address.trim() === '')) {
          return 'All heir addresses must be provided';
        }
        if ((value as HeirWithPercentage[]).some(heir => !/^0x[a-fA-F0-9]{40}$/.test(heir.address))) {
          return 'One or more invalid Ethereum address formats';
        }
        if (userAddress && (value as HeirWithPercentage[]).some(heir => heir.address.toLowerCase() === userAddress.toLowerCase())) {
          return 'An heir cannot have the same address as yours';
        }
        if ((value as HeirWithPercentage[]).some(heir => heir.percentage <= 0 || heir.percentage > 100)) {
          return 'Each heir percentage must be between 0 and 100';
        }
        break;
      
      case 'depositAmount':
        const amount = parseFloat(value as string);
        if (isNaN(amount) || amount <= 0) {
          return 'Deposit amount must be greater than 0';
        }
        if (amount < 0.001) {
          return 'Minimum deposit amount is 0.001 ETH';
        }
        break;
      
      case 'inactivityPeriod':
        const period = parseInt(value as string);
        if (isNaN(period) || period < 3600) {
          return 'Minimum inactivity period is 1 hour';
        }
        if (period > 315360000) {
          return 'Maximum inactivity period is 10 years';
        }
        break;
      
      case 'estimatedNFTCount':
        const count = parseInt(value as string);
        if (isNaN(count) || count < 0) {
          return 'NFT count cannot be negative';
        }
        break;
    }
    return '';
  };

  const calculateFees = async () => {
    try {
      const fees = await calculateCreationFees(
        formData.depositAmount,
        formData.estimatedNFTCount
      );
      setFeeBreakdown(fees);
    } catch (err) {
      console.error('Error calculating fees:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      onError?.(new Error('Please connect your wallet'));
      return;
    }

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData], address);
      if (error) errors[field] = error;
    });

    // Special validation for heirs
    const heirError = validateField('heirs', formData.heirs, address);
    if (heirError) errors.heirs = heirError;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      onError?.(new Error('Please fix the form errors'));
      return;
    }

    try {
      const params: CreateVaultParams = {
        heirs: formData.heirs,
        inactivityPeriod: formData.inactivityPeriod,
        estimatedNFTCount: formData.estimatedNFTCount,
        depositAmount: formData.depositAmount,
        depositAssets: formData.selectedAssets,
      };

      await createVault(params);
      onSuccess?.('Vault creation initiated');
    } catch (err) {
      onError?.(err as Error);
    }
  };

  React.useEffect(() => {
    calculateFees();
  }, []);

  React.useEffect(() => {
    if (isConfirmed) {
      onSuccess?.('Vault created successfully!');
    }
    if (error) {
      onError?.(new Error(error.message));
    }
  }, [isConfirmed, error, onSuccess, onError]);

  if (!mounted) {
    return (
      <Card glass={true} className="p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-600 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-48 mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card glass={true} className="p-8 text-center">
        <AnimatedShield size={48} className="text-soul-red mx-auto mb-4" />
        <h3 className="text-2xl font-family-heading text-ghost-white mb-4">
          Connect Your Wallet
        </h3>
        <p className="text-silver-dust mb-6">
          Please connect your wallet to create an inheritance vault and secure your digital legacy.
        </p>
      </Card>
    );
  }

  return (
    <Card glass={true} className="max-w-4xl mx-auto overflow-hidden">
      {/* Header with animated icon */}
      <div className="relative p-8 pb-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <AnimatedVaultIcon size={64} className="text-soul-red mx-auto mb-4" />
          <h2 className="text-4xl font-family-heading text-ghost-white mb-4">
            Create Your Inheritance Vault
          </h2>
          <p className="text-silver-dust text-lg max-w-2xl mx-auto">
            Secure your digital assets for your loved ones. Trustless, automated, and protected by smart contracts.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: Shield,
              title: 'Non-Custodial',
              description: 'You always control your assets',
              animation: 'shield' as const
            },
            {
              icon: Clock,
              title: 'Automated Timer',
              description: 'Assets distributed automatically',
              animation: 'pulse' as const
            },
            {
              icon: Users,
              title: 'Heir Protected',
              description: 'Designated beneficiary receives funds',
              animation: 'heartbeat' as const
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <AnimatedIcon
                icon={feature.icon}
                type={feature.animation}
                size={32}
                className="text-soul-red mx-auto mb-3"
              />
              <h3 className="text-lg font-family-heading text-ghost-white mb-2">
                {feature.title}
              </h3>
              <p className="text-silver-dust text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multiple Heirs Toggle */}
          <div className="mb-6">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                
                
              }}
              >
              <input
                type="checkbox"
                checked={formData.useMultipleHeirs}
                onChange={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  console.log(formData);
                  setFormData(prev => ({
                    ...prev,
                    useMultipleHeirs: !prev.useMultipleHeirs,
                    heirs: !prev.useMultipleHeirs ? [{ address: '', percentage: 100 }] : [{ address: '', percentage: 100 }],
                  }));
                }}
                className="w-5 h-5 text-soul-red bg-charcoal border-white/20 rounded focus:ring-soul-red focus:ring-2 cursor-pointer"
              />
              <span className="text-silver-dust font-medium">Use Multiple Heirs with Percentage Allocation</span>
            </div>
          </div>

          {/* Heirs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium text-silver-dust">
                {formData.useMultipleHeirs ? 'Beneficiaries' : 'Beneficiary'}
              </label>
              {formData.useMultipleHeirs && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addHeir}
                  disabled={formData.heirs.length >= 10}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Heir
                </Button>
              )}
            </div>
            
            {formData.heirs.map((heir, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative p-4 bg-charcoal rounded-lg border border-white/10"
              >
                {formData.useMultipleHeirs && formData.heirs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeir(index)}
                    className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-silver-dust">
                      Address {formData.useMultipleHeirs && `(${index + 1})`}
                    </label>
                    <input
                      type="text"
                      value={heir.address}
                      onChange={(e) => updateHeir(index, 'address', e.target.value)}
                      placeholder="0x..."
                      className={`w-full bg-charcoal border ${
                        fieldErrors.heirs ? 'border-red-500' : 'border-white/20'
                      } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
                      required
                    />
                  </div>
                  
                  {formData.useMultipleHeirs && (
                    <div className="space-y-2">
                      <label className="text-sm text-silver-dust">
                        Percentage ({heir.percentage}%)
                      </label>
                      <input
                        type="number"
                        value={heir.percentage}
                        onChange={(e) => updateHeir(index, 'percentage', parseInt(e.target.value) || 0)}
                        min="1"
                        max="100"
                        className={`w-full bg-charcoal border ${
                          fieldErrors.heirs ? 'border-red-500' : 'border-white/20'
                        } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
                        required
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {fieldErrors.heirs && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {fieldErrors.heirs}
              </div>
            )}
          </div>

            {/* Inactivity Period */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`space-y-2 ${focusedField === 'inactivityPeriod' ? 'scale-105' : ''} transition-transform`}
            >
              <label htmlFor="inactivityPeriod" className="flex items-center gap-2 text-silver-dust font-medium">
                <Clock className="w-4 h-4" />
                Inactivity Period
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="inactivityPeriod"
                  value={formData.inactivityPeriod}
                  onChange={(e) => handleInputChange('inactivityPeriod', parseInt(e.target.value) || 0)}
                  onFocus={() => setFocusedField('inactivityPeriod')}
                  onBlur={() => setFocusedField(null)}
                  min="3600"
                  max="315360000"
                  className={`w-full bg-charcoal border ${
                    fieldErrors.inactivityPeriod ? 'border-red-500' : 'border-white/20'
                  } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
                />
                {fieldErrors.inactivityPeriod && (
                  <div className="absolute -top-6 left-0 text-red-400 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.inactivityPeriod}
                  </div>
                )}
              </div>
              <p className="text-xs text-silver-dust/70">
                {Math.floor(formData.inactivityPeriod / 86400)} days • 
                Recommended: 90-365 days
              </p>
            </motion.div>

          {/* Asset Selection Section */}
          <div className="space-y-6">
            <div className="text-lg font-medium text-silver-dust">
              Assets to Deposit
            </div>
            
            {/* ETH Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-silver-dust">
                <Coins className="w-4 h-4 text-blue-400" />
                ETH Amount
              </label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => handleInputChange('depositAmount', e.target.value)}
                step="0.001"
                min="0.001"
                className={`w-full bg-charcoal border ${
                  fieldErrors.depositAmount ? 'border-red-500' : 'border-white/20'
                } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
              />
              {fieldErrors.depositAmount && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.depositAmount}
                </div>
              )}
              <p className="text-xs text-silver-dust/70">
                ≈ ${(parseFloat(formData.depositAmount || '0') * 2500).toFixed(2)} USD
              </p>
            </div>

            {/* NFT Selector */}
            <NFTSelector
              selectedNFTs={formData.selectedAssets.filter(item => item.type === 'ERC721' || item.type === 'ERC1155')}
              onNFTSelect={(nft) => {
                const newAssets = [...formData.selectedAssets, nft];
                setFormData(prev => ({
                  ...prev,
                  selectedAssets: newAssets,
                  estimatedNFTCount: newAssets.filter(item => item.type === 'ERC721' || item.type === 'ERC1155').length,
                }));
              }}
              onNFTDeselect={(nft) => {
                const newAssets = formData.selectedAssets.filter(selected => 
                  !(selected.type === nft.type && 
                    selected.tokenAddress === nft.tokenAddress && 
                    selected.tokenId === nft.tokenId)
                );
                setFormData(prev => ({
                  ...prev,
                  selectedAssets: newAssets,
                  estimatedNFTCount: newAssets.filter(item => item.type === 'ERC721' || item.type === 'ERC1155').length,
                }));
              }}
            />

            {/* Token Selector */}
            <TokenSelector
              selectedTokens={formData.selectedAssets.filter(item => item.type === 'ERC20')}
              onTokenSelect={(token) => {
                setFormData(prev => ({
                  ...prev,
                  selectedAssets: [...prev.selectedAssets, token],
                }));
              }}
              onTokenDeselect={(token) => {
                setFormData(prev => ({
                  ...prev,
                  selectedAssets: prev.selectedAssets.filter(selected => 
                    !(selected.type === token.type && selected.tokenAddress === token.tokenAddress)
                  ),
                }));
              }}
            />
          </div>

          {/* Fee Breakdown */}
          {feeBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card glass={false} className="p-6 border-soul-red/30 bg-soul-red/5">
                <div className="flex items-center gap-3 mb-4">
                  <AnimatedIcon icon={Zap} type="sparkle" size={24} className="text-soul-red" />
                  <h3 className="text-lg font-family-heading text-ghost-white">Transaction Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-dust">Deposit Amount:</span>
                      <span className="text-ghost-white font-medium">{formData.depositAmount} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-dust">Creation Fee:</span>
                      <span className="text-ghost-white font-medium">{formatEtherValue(feeBreakdown?.creationFee)} ETH</span>
                    </div>
                    {feeBreakdown?.nftFee && feeBreakdown.nftFee > BigInt(0) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-silver-dust">NFT Fee:</span>
                        <span className="text-ghost-white font-medium">{formatEtherValue(feeBreakdown?.nftFee)} ETH</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                      <span className="text-silver-dust">Total Required:</span>
                      <span className="text-xl font-family-heading text-soul-red">
                        {formatEtherValue(feeBreakdown?.total)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-silver-dust/70">
                      <span>≈ ${(parseFloat(formatEtherValue(feeBreakdown?.total) || '0') * 2500).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              type="submit"
              disabled={isLoading || Object.keys(fieldErrors).length > 0}
              className="w-full text-lg py-4 bg-gradient-to-r from-soul-red to-pulse-red hover:from-soul-red/90 hover:to-pulse-red/90 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Creating Your Vault...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <AnimatedHeartbeat size={20} className="text-white" />
                  Create Inheritance Vault
                </div>
              )}
            </Button>
            
            <p className="text-center text-xs text-silver-dust/70 mt-4">
              By creating a vault, you agree to the smart contract terms. 
              Gas fees will be charged by the network.
            </p>
          </motion.div>
        </form>
      </div>
    </Card>
  );
}
