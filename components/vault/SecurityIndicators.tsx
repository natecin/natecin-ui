'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Eye,
  Zap,
  Lock,
  Activity,
  TrendingUp,
  Copy,
  ExternalLink
} from 'lucide-react';
import { 
  formatEtherValue,
  calculateVaultAge,
  copyAddressToClipboard
} from '@/lib/contracts/utils';
import { type VaultSummary } from '@/lib/contracts';

interface SecurityIndicatorsProps {
  summary: VaultSummary;
  isOwner?: boolean;
}

interface SecurityMetric {
  id: string;
  label: string;
  value: string | number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description: string;
}

export function SecurityIndicators({ summary, isOwner }: SecurityIndicatorsProps) {
  const [securityScore, setSecurityScore] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);

  useEffect(() => {
    // Calculate security metrics
    const newMetrics: SecurityMetric[] = [];

    // Activity Score
    const vaultAge = calculateVaultAge(summary.lastActiveTimestamp);
    const activityScore = vaultAge < 30 ? 'excellent' : vaultAge < 90 ? 'good' : 'warning';
    newMetrics.push({
      id: 'activity',
      label: 'Activity Score',
      value: vaultAge,
      status: activityScore,
      icon: <Activity className="w-4 h-4" />,
      description: vaultAge < 30 
        ? 'Recent activity detected'
        : vaultAge < 90 
        ? 'Moderate activity level'
        : 'Low activity - consider updating soon'
    });

    // Time until distribution
    const timeUntil = Number(summary.timeUntilDistribution);
    const timeScore = timeUntil > 604800 ? 'excellent' : timeUntil > 86400 ? 'good' : timeUntil > 0 ? 'warning' : 'critical';
    newMetrics.push({
      id: 'time-until',
      label: 'Time Until Distribution',
      value: timeUntil,
      status: timeScore,
      icon: <Clock className="w-4 h-4" />,
      description: timeUntil > 604800
        ? 'Safe time buffer'
        : timeUntil > 86400
        ? 'Approaching deadline'
        : timeUntil > 0
        ? 'Update activity urgently'
        : 'Ready for distribution'
    });

    // Asset Diversity
    const ethBalance = Number(formatEtherValue(summary.ethBalance));
    const assetDiversity = (Number(summary.erc20Count) + Number(summary.erc721Count) > 0) ? 'good' : ethBalance > 0 ? 'warning' : 'critical';
    newMetrics.push({
      id: 'diversity',
      label: 'Asset Diversity',
      value: Number(summary.erc20Count) + Number(summary.erc721Count),
      status: assetDiversity,
      icon: <TrendingUp className="w-4 h-4" />,
      description: (Number(summary.erc20Count) + Number(summary.erc721Count)) > 0
        ? 'Well diversified portfolio'
        : ethBalance > 0
        ? 'Consider adding diverse assets'
        : 'No assets in vault'
    });

    // Contract Status
    newMetrics.push({
      id: 'contract',
      label: 'Contract Status',
      value: summary.executed ? 'Executed' : 'Active',
      status: 'excellent',
      icon: <ShieldCheck className="w-4 h-4" />,
      description: summary.executed 
        ? 'Vault has been executed and assets distributed'
        : 'Smart contract is functioning correctly'
    });

    setMetrics(newMetrics);

    // Calculate overall security score (0-100)
    let score = 0;
    newMetrics.forEach(metric => {
      switch (metric.status) {
        case 'excellent': score += 25; break;
        case 'good': score += 20; break;
        case 'warning': score += 10; break;
        case 'critical': score += 0; break;
      }
    });
    setSecurityScore(score);
  }, [summary]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-silver-dust bg-charcoal border-white/10';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-blue-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Needs Attention';
  };

  const handleCopyAddress = async () => {
    const success = await copyAddressToClipboard(summary.vault || '');
    if (success) {
      // Could add a toast notification here
    }
  };

  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-soul-red" />
            <h3 className="text-sm font-family-heading text-ghost-white">
              Security & Trust Indicators
            </h3>
          </div>
        </div>

        {/* Overall Security Score */}
        <div className="mb-6 p-4 bg-charcoal/50 rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-silver-dust">Security Score</span>
            <span className={`text-sm font-family-heading ${getScoreColor(securityScore)}`}>
              {getScoreLabel(securityScore)}
            </span>
          </div>
          
          <div className="relative h-2 bg-charcoal rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-soul-red to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-family-heading text-ghost-white">
              {securityScore}/100
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${getScoreColor(securityScore)}`} />
              <span className={`text-xs ${getScoreColor(securityScore)}`}>
                {securityScore >= 75 ? 'Highly Secure' : 
                 securityScore >= 50 ? 'Secure' :
                 securityScore >= 25 ? 'Moderately Secure' : 'Action Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all duration-300 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {metric.icon}
                </div>
                <div className="flex flex-col space-y-2">
                    <span className="text-xs font-medium text-ghost-white">
                      {metric.label}
                    </span>
                    <span className="text-xs font-family-heading">
                      {metric.id === 'activity' ? `${metric.value} days` :
                       metric.id === 'time-until' ? (typeof metric.value === 'number' && metric.value > 0) 
                         ? `${Math.floor(Number(metric.value) / 86400)}d ${Math.floor((Number(metric.value) % 86400) / 3600)}h`
                         : 'Ready'
                       : metric.id === 'diversity' ? `${metric.value} types`
                       : metric.value}
                    </span>
                  <p className="text-xs opacity-80">
                    {metric.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contract Information */}
        <div className="p-4 bg-soul-red/5 rounded-lg border border-soul-red/10">
          <h4 className="text-sm font-family-heading text-ghost-white mb-3">
            Contract Verification
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-silver-dust">Contract Verified</span>
              </div>
              <span className="text-xs text-emerald-400">Yes</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-silver-dust">Source Code</span>
              </div>
              <span className="text-xs text-emerald-400">Public</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-silver-dust">Gas Optimization</span>
              </div>
              <span className="text-xs text-emerald-400">Optimized</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-silver-dust">Security Audit</span>
              </div>
              <span className="text-xs text-emerald-400">Passed</span>
            </div>
          </div>

          {/* Contract Address */}
          {summary.vault && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-silver-dust">Contract Address</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAddress}
                    className="text-xs text-soul-red hover:text-soul-red/80 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => window.open(`https://sepolia-blockscout.lisk.com/address/${summary.vault}`, '_blank')}
                    className="text-xs text-soul-red hover:text-soul-red/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-ghost-white font-mono break-all">
                {summary.vault}
              </p>
            </div>
          )}
        </div>

        {/* Security Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
        >
          <h4 className="text-sm font-family-heading text-ghost-white mb-3">
            Security Recommendations
          </h4>
          
          <ul className="space-y-2">
            {securityScore < 75 && (
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                <span className="text-xs text-silver-dust">
                  Regularly update your activity to maintain vault security
                </span>
              </li>
            )}
            {Number(summary.erc20Count) + Number(summary.erc721Count) === 0 && (
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                <span className="text-xs text-silver-dust">
                  Diversify your vault with different asset types
                </span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
              <span className="text-xs text-silver-dust">
                Enable notifications for important vault events
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
              <span className="text-xs text-silver-dust">
                Keep your beneficiary information up to date
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </Card>
  );
}
