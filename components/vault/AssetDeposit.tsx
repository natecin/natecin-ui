'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

type AssetType = 'ETH' | 'NFTS';

interface AssetDepositProps {
  onDeposit?: (amount: string, type: AssetType) => void;
}

export function AssetDeposit({ onDeposit }: AssetDepositProps) {
  const [activeTab, setActiveTab] = useState<AssetType>('ETH');
  const [amount, setAmount] = useState('');

  const { address } = useAccount();

  const { data: ethBalanceData, isLoading: isLoadingEthBalance } = useBalance({
    address: address,
  });

  const ethBalance = ethBalanceData ? parseFloat(formatEther(ethBalanceData.value)) : 0;
  const usdConversion = 2500;

  const tabs: { id: AssetType; label: string }[] = [
    { id: 'ETH', label: 'ETH' },
    { id: 'NFTS', label: 'NFTs' },
  ];

  const handleMaxClick = () => {
    if (activeTab === 'ETH' && ethBalance > 0) {
      setAmount(ethBalance.toFixed(6));
    }
  };

  const calculatedUSD = parseFloat(amount || '0') * usdConversion;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-family-heading text-ghost-white">Deposit Assets</h3>

      <div className="flex gap-2 glass p-1 rounded">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 rounded font-family-heading transition-all ${
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-soul-red hover:text-soul-red/80 font-family-heading text-sm"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-silver-dust">
                  ≈ ${calculatedUSD.toFixed(2)} USD
                </span>
                <span className="text-silver-dust">
                  Balance: {isLoadingEthBalance ? 'Loading...' : `${ethBalance.toFixed(4)} ETH`}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'NFTS' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-silver-dust">
              NFT support coming soon. You'll be able to deposit your NFTs into the vault for inheritance.
            </p>
            {address && (
              <p className="text-sm text-silver-dust/70">
                Connected wallet: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
