'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Wallet, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Settings,
  Plus,
  Activity
} from 'lucide-react';
import { formatTimeUntilDistribution } from '@/lib/contracts/utils';
import { type VaultSummary } from '@/lib/contracts';

interface ActionCenterProps {
  summary: VaultSummary;
  isOwner?: boolean;
  onImAlive?: () => void;
  onDistribute?: () => void;
  onDeposit?: () => void;
  onSettings?: () => void;
}

interface Action {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  type: 'primary' | 'secondary' | 'warning';
  action?: () => void;
  disabled?: boolean;
  badge?: string;
}

interface GasEstimate {
  slow: string;
  standard: string;
  fast: string;
}

export function ActionCenter({ 
  summary, 
  isOwner, 
  onImAlive, 
  onDistribute, 
  onDeposit, 
  onSettings 
}: ActionCenterProps) {
  const [gasEstimate, setGasEstimate] = useState<GasEstimate>({
    slow: '12',
    standard: '18',
    fast: '25'
  });
  const [selectedGasSpeed, setSelectedGasSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');

  const getActions = (): Action[] => {
    const actions: Action[] = [];

    if (isOwner) {
      // Critical actions for owner
      if (summary.executed) {
        actions.push({
          id: 'executed',
          title: 'Vault Executed',
          description: 'This vault has been executed and assets distributed',
          icon: <CheckCircle className="w-4 h-4" />,
          priority: 'low',
          type: 'primary',
          disabled: true
        });
      } else if (summary.canDistribute) {
        actions.push({
          id: 'distribute',
          title: 'Ready to Distribute',
          description: 'Execute vault and distribute assets to beneficiary',
          icon: <Wallet className="w-4 h-4" />,
          priority: 'high',
          type: 'warning',
          action: onDistribute,
          badge: 'Ready'
        });
      } else {
        const timeLeft = Number(summary.timeUntilDistribution);
        if (timeLeft < 86400) { // Less than 24 hours
          actions.push({
            id: 'urgent-alive',
            title: 'Update Activity Urgently',
            description: 'Less than 24 hours until distribution deadline',
            icon: <AlertTriangle className="w-4 h-4" />,
            priority: 'high',
            type: 'warning',
            action: onImAlive,
            badge: 'Urgent'
          });
        } else if (timeLeft < 604800) { // Less than 7 days
          actions.push({
            id: 'alive',
            title: "I'm Alive",
            description: 'Update your activity to reset the timer',
            icon: <Heart className="w-4 h-4" />,
            priority: 'medium',
            type: 'primary',
            action: onImAlive
          });
        }
      }

      // Suggested actions
      if (Number(summary.ethBalance) < 0.01) {
        actions.push({
          id: 'deposit',
          title: 'Add Funds to Vault',
          description: 'Consider adding more ETH to increase value',
          icon: <Plus className="w-4 h-4" />,
          priority: 'low',
          type: 'secondary',
          action: onDeposit
        });
      }

      // Maintenance actions
      actions.push({
        id: 'settings',
        title: 'Vault Settings',
        description: 'Configure notifications, heirs, and preferences',
        icon: <Settings className="w-4 h-4" />,
        priority: 'low',
        type: 'secondary',
        action: onSettings
      });
    } else {
      // Non-owner actions
      actions.push({
        id: 'watch',
        title: 'Watch This Vault',
        description: 'Get notified about vault activities',
        icon: <Activity className="w-4 h-4" />,
        priority: 'medium',
        type: 'secondary'
      });
    }

    return actions;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-silver-dust bg-charcoal border-white/10';
    }
  };

  const getActionButtonStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-ghost-white';
      case 'primary': return 'bg-soul-red hover:bg-soul-red/90 text-ghost-white';
      case 'secondary': return 'glass-enhanced text-ghost-white hover:scale-105 border border-white/20';
      default: return 'glass-enhanced text-ghost-white hover:scale-105 border border-white/20';
    }
  };

  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-soul-red" />
            <h3 className="text-sm font-family-heading text-ghost-white">
              Action Center
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-silver-dust">
            <Activity className="w-3 h-3" />
            <span>{getActions().length} actions available</span>
          </div>
        </div>

        {/* Urgent Alert */}
        {isOwner && !summary.executed && Number(summary.timeUntilDistribution) < 86400 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-family-heading text-ghost-white mb-1">
                  Action Required Immediately
                </h4>
                <p className="text-xs text-silver-dust mb-2">
                  Your vault will be ready for distribution in {formatTimeUntilDistribution(summary.timeUntilDistribution)}. 
                  Update your activity now to prevent execution.
                </p>
                <Button 
                  className="text-xs bg-red-600 hover:bg-red-700"
                  onClick={onImAlive}
                >
                  Update Activity Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions List */}
        <div className="space-y-3">
          {getActions().map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border transition-all duration-300
                ${getPriorityColor(action.priority)}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-family-heading">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-soul-red/20 text-soul-red">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-80 mb-3">
                      {action.description}
                    </p>
                    
                    {/* Gas Estimate */}
                    {action.action && (
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-60">Gas:</span>
                          <div className="flex items-center gap-1">
                            {Object.entries(gasEstimate).map(([speed, price]) => (
                              <button
                                key={speed}
                                onClick={() => setSelectedGasSpeed(speed as any)}
                                className={`
                                  text-xs px-2 py-0.5 rounded transition-colors
                                  ${selectedGasSpeed === speed 
                                    ? 'bg-soul-red text-ghost-white' 
                                    : 'text-silver-dust hover:text-ghost-white'
                                  }
                                `}
                              >
                                {speed.charAt(0).toUpperCase() + speed.slice(1)}: {price} Gwei
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {action.action && (
                      <Button
                        className={`
                          text-xs
                          ${getActionButtonStyle(action.type)}
                          ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={action.action}
                        disabled={action.disabled}
                      >
                        {action.id === 'executed' ? 'Completed' : 
                         action.id === 'distribute' ? 'Execute Vault' :
                         action.id === 'deposit' ? 'Add Funds' :
                         action.id === 'settings' ? 'Configure' :
                         action.id === 'watch' ? 'Watch Vault' :
                         action.id === 'urgent-alive' || action.id === 'alive' ? "I'm Alive" :
                         'Take Action'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Smart Recommendations */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-soul-red/5 rounded-lg border border-soul-red/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-soul-red" />
              <h4 className="text-sm font-family-heading text-ghost-white">
                Smart Recommendations
              </h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-soul-red mt-1.5" />
                <span className="text-xs text-silver-dust">
                  Set up regular activity reminders to maintain vault security
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-soul-red mt-1.5" />
                <span className="text-xs text-silver-dust">
                  Consider adding multiple beneficiaries for redundancy
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-soul-red mt-1.5" />
                <span className="text-xs text-silver-dust">
                  Monitor gas prices for optimal timing of transactions
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
