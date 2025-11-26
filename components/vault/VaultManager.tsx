'use client';

import React, { useState } from 'react';
import { useConnection } from 'wagmi';
import { useVaultsByOwner } from '../../hooks/useVaults';
import { CreateVaultForm } from './CreateVaultForm';
import { VaultCard } from './VaultCard';
import type { VaultManagerProps } from '../../lib/contracts/types';

export function VaultManager({ userAddress, showCreateForm = true }: VaultManagerProps) {
  const connection = useConnection();
  const address = connection.address;
  const targetAddress = userAddress || address;
  const { vaults, isLoading, error, refetch } = useVaultsByOwner(targetAddress);
  
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateSuccess = (message: string) => {
    showNotification('success', message);
    refetch(); // Refresh vaults list
  };

  const handleCreateError = (error: Error) => {
    showNotification('error', error.message);
  };

  const handleDeposit = (vaultAddress: string) => {
    showNotification('success', `Deposit initiated for vault ${vaultAddress.slice(0, 8)}...`);
    refetch();
  };

  const handleUpdate = (vaultAddress: string) => {
    showNotification('success', `Activity updated for vault ${vaultAddress.slice(0, 8)}...`);
    refetch();
  };

  const handleDistribute = (vaultAddress: string) => {
    showNotification('success', `Distribution initiated for vault ${vaultAddress.slice(0, 8)}...`);
    refetch();
  };

  if (!targetAddress) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
        <p className="text-yellow-700">Please connect your wallet to view and manage vaults.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`rounded-lg p-4 ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Create Vault Form */}
      {showCreateForm && targetAddress === address && (
        <CreateVaultForm
          onSuccess={handleCreateSuccess}
          onError={handleCreateError}
        />
      )}

      {/* Vault Statistics */}
      {vaults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Vaults ({vaults.length})
            </h2>
            <button
              onClick={() => refetch()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vaults</h2>
          <p className="text-red-700">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Vaults State */}
      {!isLoading && !error && vaults.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Vaults Found</h2>
          <p className="text-gray-600 mb-4">
            You haven't created any vaults yet. Create your first vault to get started!
          </p>
        </div>
      )}

      {/* Vault List */}
      {!isLoading && !error && vaults.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vaultAddress) => (
            <VaultCard
              key={vaultAddress}
              vaultAddress={vaultAddress}
              onDeposit={handleDeposit}
              onUpdate={handleUpdate}
              onDistribute={handleDistribute}
            />
          ))}
        </div>
      )}
    </div>
  );
}
