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
  BellOff
} from 'lucide-react';
import { 
  shortenAddress,
  copyAddressToClipboard
} from '@/lib/contracts/utils';
import { type VaultSummary } from '@/lib/contracts';

interface BeneficiaryManagerProps {
  summary: VaultSummary;
  isOwner?: boolean;
  onEditBeneficiary?: () => void;
}

interface Beneficiary {
  address: string;
  name?: string;
  email?: string;
  verified: boolean;
  notificationEnabled: boolean;
  percentage?: number;
}

export function BeneficiaryManager({ summary, isOwner, onEditBeneficiary }: BeneficiaryManagerProps) {
  const [beneficiary, setBeneficiary] = useState<Beneficiary>({
    address: summary.heir,
    verified: false, // In production, this would be fetched from an API
    notificationEnabled: true,
    percentage: 100 // Default to 100% for single heir
  });

  const [showVerification, setShowVerification] = useState(false);

  const handleCopyAddress = async () => {
    const success = await copyAddressToClipboard(beneficiary.address);
    if (success) {
      // Could add a toast notification here
    }
  };

  const handleViewOnExplorer = () => {
    window.open(`https://etherscan.io/address/${beneficiary.address}`, '_blank');
  };

  const toggleNotifications = () => {
    setBeneficiary(prev => ({
      ...prev,
      notificationEnabled: !prev.notificationEnabled
    }));
  };

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
          {isOwner && (
            <Button 
              variant="secondary" 
              className="p-2"
              onClick={onEditBeneficiary}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Beneficiary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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

          {/* Verification Section */}
          {!beneficiary.verified && (
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-family-heading text-ghost-white mb-1">
                    Beneficiary Verification Required
                  </h4>
                  <p className="text-xs text-silver-dust mb-3">
                    Verify your beneficiary to ensure they'll receive notifications and can easily claim assets.
                  </p>
                  <Button 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => setShowVerification(!showVerification)}
                  >
                    {showVerification ? 'Hide' : 'Show'} Verification Steps
                  </Button>
                </div>
              </div>
              
              {showVerification && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                      <span className="text-yellow-400">1</span>
                    </div>
                    <span className="text-silver-dust">Send verification email to beneficiary</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                      <span className="text-yellow-400">2</span>
                    </div>
                    <span className="text-silver-dust">Beneficiary confirms wallet ownership</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                      <span className="text-yellow-400">3</span>
                    </div>
                    <span className="text-silver-dust">Verification completed</span>
                  </div>
                </motion.div>
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

          {/* Action Buttons for Owner */}
          {isOwner && (
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 text-xs"
                onClick={onEditBeneficiary}
              >
                Edit Beneficiary
              </Button>
              <Button 
                className="flex-1 text-xs"
                onClick={() => {/* Add notification test */}}
              >
                Test Notification
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Card>
  );
}
