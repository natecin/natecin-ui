'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

type AssetType = 'ETH' | 'TOKENS' | 'NFTS';

interface AssetDepositProps {
  onDeposit?: (amount: string, type: AssetType) => void;
}

export function AssetDeposit({ onDeposit }: AssetDepositProps) {
  const [activeTab, setActiveTab] = useState<AssetType>('ETH');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');

  const ethBalance = 5.234;
  const usdConversion = 2500;

  const tabs: { id: AssetType; label: string }[] = [
    { id: 'ETH', label: 'ETH' },
    { id: 'TOKENS', label: 'Tokens' },
    { id: 'NFTS', label: 'NFTs' },
  ];

  const handleMaxClick = () => {
    setAmount(ethBalance.toString());
  };

  const calculatedUSD = parseFloat(amount || '0') * usdConversion;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-heading text-ghost-white">Deposit Assets</h3>

      <div className="flex gap-2 glass p-1 rounded">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded font-heading transition-all ${
              activeTab === tab.id
                ? 'bg-soul-red text-ghost-white'
                : 'text-silver-dust hover:text-ghost-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card glass={false}>
        {activeTab === 'ETH' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-silver-dust mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white text-lg placeholder-silver-dust/50 focus:border-soul-red focus:outline-none transition-colors pr-20"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soul-red hover:text-soul-red/80 font-heading text-sm"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-silver-dust">
                  ≈ ${calculatedUSD.toFixed(2)} USD
                </span>
                <span className="text-silver-dust">
                  Balance: {ethBalance} ETH
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TOKENS' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-silver-dust mb-2">
                Select Token
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white focus:border-soul-red focus:outline-none transition-colors"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-silver-dust mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white text-lg placeholder-silver-dust/50 focus:border-soul-red focus:outline-none transition-colors pr-20"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soul-red hover:text-soul-red/80 font-heading text-sm"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-silver-dust">
                  ≈ ${parseFloat(amount || '0').toFixed(2)} USD
                </span>
                <span className="text-silver-dust">
                  Balance: 10,000 {selectedToken}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'NFTS' && (
          <div className="text-center py-8">
            <p className="text-silver-dust">
              NFT support coming soon. You'll be able to deposit your NFTs into the vault for inheritance.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
