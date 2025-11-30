'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Image, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Eye,
  EyeOff,
  ExternalLink,
  Copy
} from 'lucide-react';
import { 
  formatEtherValue, 
  copyAddressToClipboard,
  shortenAddress
} from '@/lib/contracts/utils';
import { DonutChart } from '@/components/ui/DonutChart';
import { type VaultSummary } from '@/lib/contracts';

interface AssetPortfolioProps {
  summary: VaultSummary;
}

interface AssetBreakdown {
  type: 'ETH' | 'ERC20' | 'ERC721' | 'ERC1155';
  value: number;
  count: number;
  percentage: number;
  label: string;
  color: string;
}

export function AssetPortfolio({ summary }: AssetPortfolioProps) {
  const [showValues, setShowValues] = useState(true);
  const [assetBreakdown, setAssetBreakdown] = useState<AssetBreakdown[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Calculate asset breakdown
    const ethValue = Number(formatEtherValue(summary.ethBalance));
    const erc20Count = Number(summary.erc20Count);
    const nftCount = Number(summary.erc721Count) + Number(summary.erc1155Count);
    
    // Simplified value calculation (in production, this would use real token prices)
    const erc20Value = erc20Count * 100; // Assume average $100 per token
    const nftValue = nftCount * 500; // Assume average $500 per NFT
    
    const total = ethValue + erc20Value + nftValue;
    
    const breakdown: AssetBreakdown[] = [];
    
    if (ethValue > 0) {
      breakdown.push({
        type: 'ETH',
        value: ethValue,
        count: 1,
        percentage: (ethValue / total) * 100,
        label: 'Ethereum',
        color: '#627EEA'
      });
    }
    
    if (erc20Value > 0) {
      breakdown.push({
        type: 'ERC20',
        value: erc20Value,
        count: erc20Count,
        percentage: (erc20Value / total) * 100,
        label: 'Tokens',
        color: '#26A17B'
      });
    }
    
    if (nftValue > 0) {
      breakdown.push({
        type: 'ERC721',
        value: nftValue,
        count: nftCount,
        percentage: (nftValue / total) * 100,
        label: 'NFTs',
        color: '#FF2E3B'
      });
    }
    
    setAssetBreakdown(breakdown);
    setTotalValue(total);
  }, [summary]);

  const handleCopyAddress = async (address: string) => {
    const success = await copyAddressToClipboard(address);
    // Could add a toast notification here
  };

  const handleViewOnExplorer = (address: string) => {
    window.open(`https://sepolia-blockscout.lisk.com/address/${address}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card glass={true} className="border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-soul-red" />
              <h3 className="text-sm font-family-heading text-ghost-white">
                Asset Portfolio
              </h3>
            </div>
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-2 text-silver-dust hover:text-ghost-white transition-colors"
            >
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Total Value */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-family-heading text-ghost-white">
                {showValues ? `$${totalValue.toLocaleString()}` : '••••••'}
              </span>
              <span className="text-sm text-silver-dust">
                {showValues ? 'USD Value' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                +5.2% (24h)
              </span>
            </div>
          </div>

          {/* Donut Chart */}
          {assetBreakdown.length > 0 && (
            <div className="relative h-48 mb-6">
              <DonutChart
                data={assetBreakdown.map(asset => ({
                  name: asset.label,
                  value: asset.percentage,
                  color: asset.color
                }))}
              />
            </div>
          )}

          {/* Asset Breakdown */}
          <div className="space-y-3">
            {assetBreakdown.map((asset, index) => (
              <motion.div
                key={asset.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-charcoal/50 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div>
                    <p className="text-sm text-ghost-white font-medium">
                      {asset.label}
                    </p>
                    <p className="text-xs text-silver-dust">
                      {asset.count} {asset.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ghost-white font-family-heading">
                    {showValues ? `$${asset.value.toLocaleString()}` : '•••'}
                  </p>
                  <p className="text-xs text-silver-dust">
                    {asset.percentage.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Detailed Asset Information */}
      <Card glass={true} className="border border-white/20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-4 h-4 text-soul-red" />
            <h3 className="text-sm font-family-heading text-ghost-white">
              Asset Details
            </h3>
          </div>

          <div className="space-y-4">
            {/* ETH Balance */}
            <div className="p-4 bg-charcoal/50 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-400">ETH</span>
                  </div>
                  <div>
                    <p className="text-sm text-ghost-white font-medium">Ethereum</p>
                    <p className="text-xs text-silver-dust">Native Asset</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ghost-white font-family-heading">
                    {formatEtherValue(summary.ethBalance)} ETH
                  </p>
                  <p className="text-xs text-silver-dust">
                    ~${(Number(formatEtherValue(summary.ethBalance)) * 2000).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">
                  +2.5% (24h)
                </span>
              </div>
            </div>

            {/* Token Holdings */}
            {summary.erc20Count > 0 && (
              <div className="p-4 bg-charcoal/50 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Coins className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-ghost-white font-medium">Tokens</p>
                      <p className="text-xs text-silver-dust">ERC-20 Assets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ghost-white font-family-heading">
                      {summary.erc20Count} Types
                    </p>
                    <p className="text-xs text-silver-dust">
                      ~${(Number(summary.erc20Count) * 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-silver-dust">
                  {summary.erc20Count} different token contracts held
                </div>
              </div>
            )}

            {/* NFT Holdings */}
            {(summary.erc721Count > 0 || summary.erc1155Count > 0) && (
              <div className="p-4 bg-charcoal/50 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-ghost-white font-medium">NFTs</p>
                      <p className="text-xs text-silver-dust">
                        {Number(summary.erc721Count) > 0 && 'ERC-721 '}
                        {Number(summary.erc721Count) > 0 && Number(summary.erc1155Count) > 0 && '& '}
                        {Number(summary.erc1155Count) > 0 && 'ERC-1155 '}
                        Assets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ghost-white font-family-heading">
                      {Number(summary.erc721Count) + Number(summary.erc1155Count)} Items
                    </p>
                    <p className="text-xs text-silver-dust">
                      ~${((Number(summary.erc721Count) + Number(summary.erc1155Count)) * 500).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 text-xs text-silver-dust">
                  {Number(summary.erc721Count) > 0 && (
                    <span>{summary.erc721Count} ERC-721</span>
                  )}
                  {Number(summary.erc1155Count) > 0 && (
                    <span>{summary.erc1155Count} ERC-1155</span>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {summary.erc20Count === 0 && summary.erc721Count === 0 && summary.erc1155Count === 0 && Number(summary.ethBalance) === 0 && (
              <div className="text-center py-8 px-4 bg-charcoal/50 rounded-lg border border-white/5">
                <Wallet className="w-12 h-12 text-silver-dust mx-auto mb-3" />
                <p className="text-sm text-ghost-white font-family-heading mb-1">
                  No Assets Yet
                </p>
                <p className="text-xs text-silver-dust">
                  Deposit ETH, tokens, or NFTs to populate your vault
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
