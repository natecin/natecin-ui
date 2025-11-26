'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Vault, 
  Shield, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { useConnection } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomToggle } from '@/components/ui/CustomToggle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NFTSelector } from './NFTSelector';
import { TokenSelector } from './TokenSelector';
import { HeirManager } from './HeirManager';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { DEFAULT_INACTIVITY_PERIOD, type HeirWithPercentage, type DepositAsset } from '@/lib/contracts';
import { calculateCreationFees, formatEtherValue } from '@/lib/contracts/utils';
import { Address } from 'viem';

interface VaultCreationWizardProps {
  onSubmit: (data: CreateVaultData) => void;
  isLoading?: boolean;
  initialData?: Partial<CreateVaultData>;
}

interface CreateVaultData {
  heirs: HeirWithPercentage[];
  inactivityPeriod: number;
  estimatedNFTCount: number;
  depositAmount: string;
  selectedAssets: DepositAsset[];
  useMultipleHeirs: boolean;
}

export function VaultCreationWizard({ onSubmit, isLoading, initialData }: VaultCreationWizardProps) {
  const connection = useConnection();
  const address = connection.address;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateVaultData>({
    heirs: [{ address: '', percentage: 100 }],
    inactivityPeriod: DEFAULT_INACTIVITY_PERIOD,
    estimatedNFTCount: 0,
    depositAmount: '0.1',
    selectedAssets: [],
    useMultipleHeirs: false,
    ...initialData,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);

  const steps = [
    {
      id: 'heirs',
      label: 'Beneficiaries',
      description: 'Configure inheritance distribution',
      icon: Users,
    },
    {
      id: 'timing',
      label: 'Timing',
      description: 'Set inactivity period',
      icon: Shield,
    },
    {
      id: 'assets',
      label: 'Assets',
      description: 'Select assets to deposit',
      icon: Vault,
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Confirm and create',
      icon: CheckCircle,
    },
  ];

  // Calculate fees when relevant data changes
  useEffect(() => {
    calculateFees();
  }, [formData.depositAmount, formData.estimatedNFTCount]);

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

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or next step if current is valid
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && validateCurrentStep())) {
      setCurrentStep(stepIndex);
    }
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Heirs
        if (formData.heirs.some(heir => !heir.address || heir.address.trim() === '')) {
          errors.heirs = 'All heir addresses must be provided';
        }
        if (formData.heirs.some(heir => heir.address && !/^0x[a-fA-F0-9]{40}$/.test(heir.address))) {
          errors.heirs = 'Invalid Ethereum address format';
        }
        if (address && formData.heirs.some(heir => heir.address && heir.address.toLowerCase() === address.toLowerCase())) {
          errors.heirs = 'An heir cannot have the same address as yours';
        }
        const totalPercentage = formData.heirs.reduce((sum, heir) => sum + heir.percentage, 0);
        if (formData.useMultipleHeirs && totalPercentage !== 100) {
          errors.heirs = `Heir percentages must sum to 100% (currently ${totalPercentage}%)`;
        }
        break;
        
      case 1: // Timing
        if (formData.inactivityPeriod < 3600) {
          errors.inactivityPeriod = 'Minimum inactivity period is 1 hour';
        }
        if (formData.inactivityPeriod > 315360000) {
          errors.inactivityPeriod = 'Maximum inactivity period is 10 years';
        }
        break;
        
      case 2: // Assets
        if (parseFloat(formData.depositAmount) <= 0) {
          errors.depositAmount = 'Deposit amount must be greater than 0';
        }
        if (parseFloat(formData.depositAmount) < 0.001) {
          errors.depositAmount = 'Minimum deposit amount is 0.001 ETH';
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onSubmit(formData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addHeir = () => {
    const currentTotal = formData.heirs.reduce((sum, heir) => sum + heir.percentage, 0);
    const remaining = 100 - currentTotal;
    
    if (remaining > 0 && formData.heirs.length < 10) {
      setFormData(prev => ({
        ...prev,
        heirs: [...prev.heirs, { address: '', percentage: Math.min(remaining, 50) }],
      }));
    }

  const updateHeir = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const newHeirs = [...formData.heirs];
    
    if (field === 'address') {
      newHeirs[index].address = value as Address | '';
    } else {
      newHeirs[index].percentage = Number(value) as number;
    }
    
    setFormData(prev => ({
      ...prev,
      heirs: newHeirs,
    }));
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;
    
    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Step Header */}
        <div className="text-center space-y-2">
          <AnimatedIcon icon={Icon} type="pulse" size={48} className="text-soul-red mx-auto mb-4" />
          <h2 className="text-2xl font-family-heading text-ghost-white">
            {currentStepData.label}
          </h2>
          <p className="text-silver-dust">
            {currentStepData.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 0 && (
            // Heirs Configuration Step
            <div className="space-y-6">
              <CustomToggle
                checked={formData.useMultipleHeirs}
                onChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    useMultipleHeirs: checked,
                    heirs: checked ? [{ address: '', percentage: 100 }] : [{ address: '', percentage: 100 }],
                  }));
                }}
                label="Multiple Beneficiaries"
                description="Split inheritance between multiple beneficiaries with custom percentages"
              />
              
              {/* Use HeirManager for both single and multiple beneficiaries */}
              <HeirManager 
                heirs={formData.heirs.map((heir, index) => ({
                  id: `heir-${index}`,
                  address: heir.address,
                  percentage: heir.percentage
                }))}
                onChange={(heirs) => {
                  const updatedHeirs: HeirWithPercentage[] = heirs.map(h => ({
                    address: h.address as Address | '',
                    percentage: h.percentage
                  }));
                  setFormData(prev => ({ ...prev, heirs: updatedHeirs }));
                }}
              />
              
              {fieldErrors.heirs && (
                <div className="flex items-center gap-2 text-pulse-red text-sm p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.heirs}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 1 && (
            // Timing Configuration Step
            <div className="space-y-6">
              <Card glass={true} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-silver-dust mb-2">
                      Inactivity Period (in seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.inactivityPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, inactivityPeriod: parseInt(e.target.value) || 0 }))}
                      min="3600"
                      max="315360000"
                      className={`w-full bg-charcoal border ${
                        fieldErrors.inactivityPeriod ? 'border-pulse-red' : 'border-white/20'
                      } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
                    />
                    {fieldErrors.inactivityPeriod && (
                      <p className="text-sm text-pulse-red mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.inactivityPeriod}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '1 Day', value: 86400 },
                      { label: '1 Week', value: 604800 },
                      { label: '1 Month', value: 2592000 },
                      { label: '6 Months', value: 15552000 },
                    ].map((preset) => (
                      <Button
                        key={preset.label}
                        variant="secondary"
                        onClick={() => setFormData(prev => ({ ...prev, inactivityPeriod: preset.value }))}
                        className="w-full text-sm"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-silver-dust">
                      Current setting: <span className="text-ghost-white font-medium">
                        {Math.floor(formData.inactivityPeriod / 86400)} days
                      </span>
                    </p>
                    <p className="text-xs text-silver-dust/70 mt-2">
                      After this period of inactivity, your beneficiaries will be able to claim the assets.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {currentStep === 2 && (
            // Asset Selection Step
            <div className="space-y-6">
              <Card glass={true} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-silver-dust mb-2">
                      ETH Amount to Deposit
                    </label>
                    <input
                      type="number"
                      value={formData.depositAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                      step="0.001"
                      min="0.001"
                      className={`w-full bg-charcoal border ${
                        fieldErrors.depositAmount ? 'border-pulse-red' : 'border-white/20'
                      } rounded-lg px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none focus:ring-2 focus:ring-soul-red/20 transition-all`}
                    />
                    {fieldErrors.depositAmount && (
                      <p className="text-sm text-pulse-red mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.depositAmount}
                      </p>
                    )}
                    <p className="text-xs text-silver-dust/70 mt-2">
                      ≈ ${(parseFloat(formData.depositAmount || '0') * 2500).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </Card>
              
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
                    !(selected.type === nft.type && selected.tokenAddress === nft.tokenAddress && selected.tokenId === nft.tokenId)
                  );
                  setFormData(prev => ({
                    ...prev,
                    selectedAssets: newAssets,
                    estimatedNFTCount: newAssets.filter(item => item.type === 'ERC721' || item.type === 'ERC1155').length,
                  }));
                }}
              />
              
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
          )}
          
          {currentStep === 3 && (
            // Review Step
            <div className="space-y-6">
              <Card glass={true} className="p-6">
                <h3 className="text-lg font-family-heading text-ghost-white mb-4">
                  Vault Configuration Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-silver-dust">Beneficiaries</p>
                      <p className="text-ghost-white font-medium">
                        {formData.heirs.length} {formData.heirs.length === 1 ? 'Beneficiary' : 'Beneficiaries'}
                      </p>
                      {formData.heirs.map((heir, index) => (
                        <p key={index} className="text-xs text-silver-dust/70 mt-1">
                          {heir.address.slice(0, 6)}...{heir.address.slice(-4)} - {heir.percentage}%
                        </p>
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-sm text-silver-dust">Inactivity Period</p>
                      <p className="text-ghost-white font-medium">
                        {Math.floor(formData.inactivityPeriod / 86400)} days
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-silver-dust">ETH Deposit</p>
                      <p className="text-ghost-white font-medium">{formData.depositAmount} ETH</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-silver-dust">Additional Assets</p>
                      <p className="text-ghost-white font-medium">
                        {formData.selectedAssets.length} {formData.selectedAssets.length === 1 ? 'Asset' : 'Assets'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {feeBreakdown && (
                <Card glass={false} className="p-6 border-soul-red/30 bg-soul-red/5">
                  <h3 className="text-lg font-family-heading text-ghost-white mb-4">
                    Transaction Details
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-dust">Deposit Amount:</span>
                      <span className="text-ghost-white font-medium">{formData.depositAmount} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-silver-dust">Creation Fee:</span>
                      <span className="text-ghost-white font-medium">{formatEtherValue(feeBreakdown?.creationFee)} ETH</span>
                    </div>
                    {feeBreakdown?.nftFee && feeBreakdown.nftFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-silver-dust">NFT Fee:</span>
                        <span className="text-ghost-white font-medium">{formatEtherValue(feeBreakdown?.nftFee)} ETH</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg border-t border-white/20 pt-2 mt-2">
                      <span className="text-silver-dust">Total Required:</span>
                      <span className="text-xl font-family-heading text-soul-red">
                        {formatEtherValue(feeBreakdown?.total)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-silver-dust/70">
                      <span>≈ ${(parseFloat(formatEtherValue(feeBreakdown?.total) || '0') * 2500).toFixed(2)} USD</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card glass={true} className="w-full max-w-4xl mx-auto overflow-hidden">
      <div className="p-8">
        {/* Progress Bar */}
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>
      
      {/* Step Content */}
      <div className="p-8 pt-0">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="p-8 pt-0">
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-soul-red to-pulse-red hover:from-soul-red/90 hover:to-pulse-red/90"
          >
            {currentStep === steps.length - 1 ? (
              <>
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Create Vault
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
        
        <p className="text-center text-xs text-silver-dust/70 mt-4">
          By creating a vault, you agree to the smart contract terms. 
          Gas fees will be charged by the network.
        </p>
      </div>
    </Card>
  );
}
}
