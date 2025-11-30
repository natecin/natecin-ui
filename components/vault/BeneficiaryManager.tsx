'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Edit,
  Bell,
  BellOff,
  Save,
  X,
  Wallet
} from 'lucide-react';
import { 
  shortenAddress,
  copyAddressToClipboard,
  isValidAddress
} from '@/lib/contracts/utils';
import { type VaultSummary } from '@/lib/contracts';
import { useUpdateHeir } from '@/hooks/useVaults';

interface BeneficiaryManagerProps {
  summary: VaultSummary;
  isOwner?: boolean;
  onEditBeneficiary?: () => void;
  onRefetch?: () => void;
}

interface Beneficiary {
  address: string;
  name?: string;
  email?: string;
  verified: boolean;
  notificationEnabled: boolean;
  percentage?: number;
}

export function BeneficiaryManager({ summary, isOwner, onEditBeneficiary, onRefetch }: BeneficiaryManagerProps) {
  const { updateHeir, isLoading, isConfirmed, error } = useUpdateHeir();
  const [beneficiary, setBeneficiary] = useState<Beneficiary>({
    address: summary.heir,
    verified: false, // In production, this would be fetched from an API
    notificationEnabled: true,
    percentage: 100 // Default to 100% for single heir
  });

  const [showVerification, setShowVerification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newBeneficiaryAddress, setNewBeneficiaryAddress] = useState<string>(summary.heir);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed'>('idle');

  const handleCopyAddress = async () => {
    const success = await copyAddressToClipboard(beneficiary.address);
    if (success) {
      // Could add a toast notification here
    }
  };

  const handleViewOnExplorer = () => {
    window.open(`https://sepolia-blockscout.lisk.com/address/${beneficiary.address}`, '_blank');
  };

  const toggleNotifications = () => {
    setBeneficiary(prev => ({
      ...prev,
      notificationEnabled: !prev.notificationEnabled
    }));
  };

  const handleEditBeneficiary = () => {
    setIsEditing(true);
    setNewBeneficiaryAddress(beneficiary.address);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewBeneficiaryAddress(beneficiary.address);
    setTransactionStatus('idle');
  };

  const handleSubmitEdit = () => {
    if (!isValidAddress(newBeneficiaryAddress)) {
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setConfirmDialogOpen(false);
      setTransactionStatus('pending');
      
      await updateHeir(summary.vault, newBeneficiaryAddress as `0x${string}`);
      setTransactionStatus('confirming');
    } catch (err) {
      setTransactionStatus('failed');
      console.error('Failed to update beneficiary:', err);
    }
  };

  // Handle transaction confirmation
  React.useEffect(() => {
    if (isConfirmed && transactionStatus === 'confirming') {
      setTransactionStatus('confirmed');
      // Update the beneficiary address locally
      setBeneficiary(prev => ({
        ...prev,
        address: newBeneficiaryAddress,
        verified: false // Reset verification status
      }));
      // Refetch vault data to ensure consistency
      if (onRefetch) {
        onRefetch();
      }
      // Close edit mode after a delay
      setTimeout(() => {
        setIsEditing(false);
        setTransactionStatus('idle');
      }, 2000);
    }
  }, [isConfirmed, transactionStatus, newBeneficiaryAddress, onRefetch]);

  // Handle errors
  React.useEffect(() => {
    if (error && transactionStatus !== 'idle') {
      setTransactionStatus('failed');
      setTimeout(() => {
        setTransactionStatus('idle');
      }, 3000);
    }
  }, [error, transactionStatus]);

  const getVerificationStatus = () => {
    if (beneficiary.verified) {
      return (
        <div className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-xs">Verified</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-yellow-400">
        <AlertCircle className="w-3 h-3" />
        <span className="text-xs">Not Verified</span>
      </div>
    );
  };

  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-soul-red" />
            <h3 className="text-sm font-family-heading text-ghost-white">
              Beneficiary Management
            </h3>
          </div>
        </div>

        {/* Beneficiary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {isEditing ? (
            /* Edit Mode */
            <div className="p-4 bg-charcoal/50 rounded-lg border border-soul-red/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-family-heading text-ghost-white">Edit Beneficiary</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-silver-dust block mb-2">New Beneficiary Address</label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-silver-dust" />
                    <input
                      type="text"
                      value={newBeneficiaryAddress}
                      onChange={(e) => setNewBeneficiaryAddress(e.target.value)}
                      className={`w-full p-2 bg-charcoal border rounded text-sm text-ghost-white focus:outline-none ${
                        isValidAddress(newBeneficiaryAddress) 
                          ? 'border-soul-red/50' 
                          : 'border-red-500/50'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="0x..."
                      disabled={isLoading || transactionStatus !== 'idle'}
                    />
                  </div>
                  {!isValidAddress(newBeneficiaryAddress) && (
                    <p className="text-xs text-red-400 mt-1">Please enter a valid Ethereum address</p>
                  )}
                </div>

                {/* Transaction Status */}
                {transactionStatus !== 'idle' && (
                  <div className={`p-3 rounded-lg text-xs ${
                    transactionStatus === 'confirmed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : transactionStatus === 'failed'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-soul-red/10 text-soul-red border border-soul-red/20'
                  }`}>
                    {transactionStatus === 'pending' && 'Waiting for MetaMask confirmation...'}
                    {transactionStatus === 'confirming' && 'Transaction pending confirmation...'}
                    {transactionStatus === 'confirmed' && '✓ Beneficiary updated successfully!'}
                    {transactionStatus === 'failed' && 'Transaction failed. Please try again.'}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-xs"
                    onClick={handleSubmitEdit}
                    disabled={!isValidAddress(newBeneficiaryAddress) || isLoading || transactionStatus !== 'idle'}
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <div className="p-4 bg-charcoal/50 rounded-lg border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-family-heading text-ghost-white">
                      {beneficiary.name || 'Primary Beneficiary'}
                    </h4>
                    {getVerificationStatus()}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-silver-dust mb-3">
                    <span>{shortenAddress(beneficiary.address, 8)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopyAddress}
                        className="hover:text-ghost-white transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleViewOnExplorer}
                        className="hover:text-ghost-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-silver-dust">
                      Distribution: {beneficiary.percentage}%
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        beneficiary.notificationEnabled 
                          ? 'text-emerald-400 hover:text-emerald-300' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {beneficiary.notificationEnabled ? (
                        <Bell className="w-3 h-3" />
                      ) : (
                        <BellOff className="w-3 h-3" />
                      )}
                      {beneficiary.notificationEnabled ? 'Notified' : 'Not Notified'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {beneficiary.email && (
                <div className="flex items-center gap-2 text-xs text-silver-dust">
                  <Mail className="w-3 h-3" />
                  <span>{beneficiary.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Distribution Information */}
          <div className="p-4 bg-soul-red/10 rounded-lg border border-soul-red/20">
            <h4 className="text-sm font-family-heading text-ghost-white mb-3">
              Distribution Details
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-silver-dust">Total Percentage</span>
                <span className="text-ghost-white">{beneficiary.percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-dust">Notification Status</span>
                <span className={beneficiary.notificationEnabled ? 'text-emerald-400' : 'text-gray-400'}>
                  {beneficiary.notificationEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-dust">Claim Method</span>
                <span className="text-ghost-white">Automatic</span>
              </div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {confirmDialogOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="p-6 bg-charcoal border border-white/20 rounded-lg max-w-sm w-full mx-4">
                <h3 className="text-sm font-family-heading text-ghost-white mb-4">
                  Confirm Beneficiary Update
                </h3>
                <p className="text-xs text-silver-dust mb-6">
                  You are about to change the beneficiary from {shortenAddress(beneficiary.address)} to {shortenAddress(newBeneficiaryAddress)}. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => setConfirmDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-xs"
                    onClick={handleConfirmUpdate}
                    disabled={isLoading}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons for Owner */}
          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs"
                onClick={handleEditBeneficiary}
                disabled={isLoading}
              >
                Edit Beneficiary
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Card>
  );
}
