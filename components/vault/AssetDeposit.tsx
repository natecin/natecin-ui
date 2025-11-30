'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useConnection, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useDepositETH, useDepositERC721, useVaultsByOwner } from '@/hooks/useVaults';

type AssetType = 'ETH' | 'ERC20' | 'NFTS';

interface AssetDepositProps {
  vaultAddress?: string;
  onDeposit?: (amount: string, type: AssetType) => void;
}

export function AssetDeposit({ vaultAddress, onDeposit }: AssetDepositProps) {
  const [activeTab, setActiveTab] = useState<AssetType>('ETH');
  const [amount, setAmount] = useState('');
  const [selectedVault, setSelectedVault] = useState(vaultAddress || '');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const connection = useConnection();
  const address = connection.address;
  const { vaults } = useVaultsByOwner(address);
  const { deposit, isLoading: isDepositingETH, isConfirmed } = useDepositETH();
  const { deposit: depositNFT, isLoading: isDepositingNFT } = useDepositERC721();

  const { data: ethBalanceData, isLoading: isLoadingEthBalance } = useBalance({
    address: address,
  });

  const ethBalance = ethBalanceData ? parseFloat(formatEther(ethBalanceData.value)) : 0;
  const usdConversion = 2500;

  const tabs: { id: AssetType; label: string }[] = [
    { id: 'ETH', label: 'ETH' },
    { id: 'ERC20', label: 'ERC20' },
    { id: 'NFTS', label: 'NFTs' },
  ];

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleMaxClick = () => {
    if (ethBalance > 0) {
      setAmount(ethBalance.toFixed(6));
    }
  };

  const handleDepositETH = async () => {
    if (!selectedVault || !amount) {
      showNotification('error', 'Please select a vault and enter an amount');
      return;
    }

    try {
      await deposit(selectedVault as `0x${string}`, amount);
      // Success notification will be handled by useEffect when isConfirmed becomes true
    } catch (error) {
      showNotification('error', `Deposit failed: ${(error as Error).message}`);
    }
  };

  // Monitor transaction confirmation
  React.useEffect(() => {
    if (isConfirmed) {
      showNotification('success', `Deposited ${amount} ETH to vault`);
      setAmount('');
      onDeposit?.(amount, 'ETH');
    }
  }, [isConfirmed, amount, selectedVault, showNotification, onDeposit]);

  const calculatedUSD = parseFloat(amount || '0') * usdConversion;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-family-heading text-ghost-white">Deposit Assets</h3>
        {notification && (
          <div
            className={`rounded-lg p-3 text-sm ${
              notification.type === 'success'
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>

      {/* Vault Selection */}
      {!vaultAddress && vaults.length > 0 && (
        <div>
          <label className="block text-sm text-silver-dust mb-2">
            Select Vault
          </label>
          <select
            value={selectedVault}
            onChange={(e) => setSelectedVault(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white focus:border-soul-red focus:outline-none transition-colors"
          >
            <option value="">Choose a vault...</option>
            {vaults.map((vault) => (
              <option key={vault} value={vault}>
                Vault {vault.slice(0, 8)}...{vault.slice(-6)}
              </option>
            ))}
          </select>
        </div>
      )}

      {vaults.length === 0 && !vaultAddress && (
        <Card glass={false} className="p-6 text-center">
          <p className="text-silver-dust mb-4">
            No vaults found. Create a vault first to deposit assets.
          </p>
        </Card>
      )}

      {(selectedVault || vaultAddress) && (
        <>
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

                <Button
                  onClick={handleDepositETH}
                  disabled={!amount || parseFloat(amount) <= 0 || isDepositingETH}
                  className="w-full"
                >
                  {isDepositingETH ? 'Depositing...' : `Deposit ${amount || '0'} ETH`}
                </Button>
              </div>
            )}

            {activeTab === 'ERC20' && (
              <div className="text-center py-8 space-y-4">
                <p className="text-silver-dust">
                  ERC20 token support coming soon. You'll be able to deposit your tokens into the vault for inheritance.
                </p>
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
        </>
      )}
    </div>
  );
}
