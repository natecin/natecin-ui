'use client';

import React, { useState, useEffect } from 'react';
import { useConnection } from 'wagmi';
import { type HeirWithPercentage, type DepositAsset, type CreateVaultParams } from '../../lib/contracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedShield, AnimatedVaultIcon } from '@/components/ui/AnimatedIcon';
import { VaultCreationWizard } from './VaultCreationWizard';
import { useCreateVault } from '../../hooks/useVaults';
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
  
  const handleWizardSubmit = async (wizardData: any): Promise<void> => {
    if (!address) {
      onError?.(new Error('Please connect your wallet'));
      return;
    }

    try {
      const params: CreateVaultParams = {
        heirs: wizardData.heirs,
        inactivityPeriod: wizardData.inactivityPeriod,
        estimatedNFTCount: wizardData.estimatedNFTCount,
        depositAmount: wizardData.depositAmount,
        depositAssets: wizardData.selectedAssets,
      };

      await createVault(params);
      onSuccess?.('Vault creation initiated');
    } catch (err) {
      onError?.(err as Error);
    }
  };

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
      <VaultCreationWizard
        onSubmit={handleWizardSubmit}
        isLoading={isLoading}
      />
  );
}
