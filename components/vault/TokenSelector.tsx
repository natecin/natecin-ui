'use client';

import React, { useState } from 'react';
import { Coins, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWalletERC20Tokens } from '../../hooks/useVaults';
import type { DepositAsset } from '../../lib/contracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TokenSelectorProps {
  selectedTokens: DepositAsset[];
  onTokenSelect: (token: DepositAsset) => void;
  onTokenDeselect: (token: DepositAsset) => void;
}

// Common token addresses - moved outside component to prevent re-creation on every render
const commonTokens = [
  '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
] as `0x${string}`[];

export function TokenSelector({ 
  selectedTokens, 
  onTokenSelect, 
  onTokenDeselect
}: TokenSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, string>>({});
  
  const { tokens, isLoading } = useWalletERC20Tokens(undefined, commonTokens);

  const isTokenSelected = (token: DepositAsset) => {
    return selectedTokens.some(selected => 
      selected.type === token.type && 
      selected.tokenAddress === token.tokenAddress
    );
  };

  const handleTokenAmountChange = (tokenAddress: string, amount: string) => {
    setTokenAmounts(prev => ({
      ...prev,
      [tokenAddress]: amount,
    }));
  };

  const toggleTokenSelection = (token: DepositAsset) => {
    const amount = tokenAmounts[token.tokenAddress || ''] || '0';
    
    if (amount === '0' || parseFloat(amount) <= 0) {
      return; // Don't select tokens with zero amount
    }

    const tokenWithAmount = {
      ...token,
      amount,
    };

    if (isTokenSelected(token)) {
      onTokenDeselect(tokenWithAmount);
      setTokenAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[token.tokenAddress || ''];
        return newAmounts;
      });
    } else {
      onTokenSelect(tokenWithAmount);
    }
  };

  const formatBalance = (balance: string, decimals: number = 18) => {
    const bal = parseFloat(balance) / Math.pow(10, decimals);
    return bal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-silver-dust">
            Tokens to Include ({selectedTokens.length})
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowSelector(!showSelector)}
          className="text-xs px-4 py-2"
        >
          {showSelector ? 'Hide' : 'Select'} Tokens
        </Button>
      </div>

      {/* Selected Tokens Preview */}
      {selectedTokens.length > 0 && (
        <div className="space-y-2">
          {selectedTokens.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-charcoal rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Coins className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-ghost-white">
                    {token.symbol || 'Token'}
                  </div>
                  <div className="text-xs text-silver-dust">
                    {token.name || 'Unknown Token'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ghost-white">
                  {formatBalance(token.amount || '0', token.decimals)} {token.symbol}
                </span>
                <button
                  type="button"
                  onClick={() => onTokenDeselect(token)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token Selector Modal */}
      {showSelector && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSelector(false)}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-charcoal rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-family-heading text-ghost-white">
                  Select Tokens for Vault
                </h3>
                <Button
                  variant="secondary"
                  onClick={() => setShowSelector(false)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-silver-dust mt-2">
                Choose tokens to include in your inheritance vault
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soul-red"></div>
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 text-silver-dust/50 mx-auto mb-4" />
                  <p className="text-silver-dust">No tokens found in your wallet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token, index) => {
                    const selected = isTokenSelected(token);
                    const currentAmount = tokenAmounts[token.tokenAddress || ''] || '0';
                    const maxAmount = formatBalance(token.amount || '0', token.decimals);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selected
                            ? 'border-soul-red bg-soul-red/5'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selected ? 'bg-soul-red/20' : 'bg-green-500/20'
                            }`}>
                              <Coins className={`w-5 h-5 ${selected ? 'text-soul-red' : 'text-green-400'}`} />
                            </div>
                            <div>
                              <div className="font-medium text-ghost-white">
                                {token.symbol || 'Token'}
                              </div>
                              <div className="text-sm text-silver-dust">
                                Balance: {maxAmount} {token.symbol}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={currentAmount}
                                onChange={(e) => handleTokenAmountChange(token.tokenAddress || '', e.target.value)}
                                placeholder="0"
                                step="0.000001"
                                min="0"
                                max={maxAmount}
                                className={`w-24 bg-charcoal border ${
                                  selected ? 'border-soul-red' : 'border-white/20'
                                } rounded px-2 py-1 text-ghost-white text-sm focus:outline-none focus:ring-1 focus:ring-soul-red`}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-sm text-silver-dust">
                                {token.symbol}
                              </span>
                            </div>
                            
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              selected
                                ? 'border-soul-red bg-soul-red'
                                : 'border-white/30'
                            }`}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-silver-dust">
                  {selectedTokens.length} token types selected
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSelector(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowSelector(false)}
                    className="bg-soul-red hover:bg-soul-red/90"
                  >
                    Confirm Selection ({selectedTokens.length})
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
