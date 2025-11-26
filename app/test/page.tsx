'use client';

import React from 'react';
import { useConnection } from 'wagmi';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVaultsByOwner } from '@/hooks/useVaults';
import { useRegistryStats, useDistributableVaults } from '@/hooks/useVaultRegistry';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { shortenAddress } from '@/lib/contracts/utils';
import { Settings, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';

export default function TestPage() {
  const connection = useConnection();
  const address = connection.address;
  const isConnected = connection.isConnected;
  
  // Test all vault integrations
  const { vaults, isLoading: vaultsLoading, error: vaultsError } = useVaultsByOwner(address);
  const { vaults: distributable, isLoading: distributableLoading } = useDistributableVaults();
  const { totalVaults, distributableVaults, registryAddress } = useRegistryStats();  
  
  const testResults = [
    {
      name: 'Contract Addresses',
      status: 'success',
      details: `Factory: ${shortenAddress(CONTRACT_ADDRESSES.factory)}<br/>Registry: ${shortenAddress(CONTRACT_ADDRESSES.registry)}`,
    },
    {
      name: 'Wallet Connection',
      status: isConnected ? 'success' : 'warning',
      details: isConnected ? `Connected: ${shortenAddress(address || '0x0')}` : 'Not connected',
    },
    {
      name: 'User Vaults',
      status: vaultsError ? 'error' : vaultsLoading ? 'pending' : 'success',
      details: vaultsError ? vaultsError.message : `Found ${vaults.length} vaults`,
    },
    {
      name: 'Registry Stats',
      status: totalVaults > 0 ? 'success' : 'warning',
      details: `Total: ${totalVaults} | Distributable: ${distributableVaults}`,
    },
    {
      name: 'Distributable Vaults',
      status: distributableLoading ? 'pending' : 'success',
      details: `${distributable.length} vaults ready for distribution`,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-900/10';
      case 'error':
        return 'border-red-500/30 bg-red-900/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-900/10';
      case 'pending':
        return 'border-blue-500/30 bg-blue-900/10';
      default:
        return 'border-gray-500/30 bg-gray-900/10';
    }
  };

  return (
    <div className="min-h-screen noise-texture pt-20">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Settings className="w-8 h-8 text-soul-red" />
            <h1 className="text-4xl font-family-heading text-ghost-white">
              Integration Test
            </h1>
          </div>
          <p className="text-silver-dust">
            Verify NATECIN Vault System Integration
          </p>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-family-heading text-ghost-white flex items-center gap-2">
            <Database className="w-6 h-6" />
            Test Results
          </h2>
          
          {testResults.map((result, index) => (
            <Card 
              key={index}
              glass={true}
              className={`p-4 ${getStatusColor(result.status)} border`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="text-lg font-medium text-ghost-white">
                      {result.name}
                    </h3>
                    <p 
                      className="text-sm text-silver-dust mt-1"
                      dangerouslySetInnerHTML={{ __html: result.details }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Contract Information */}
        <Card glass={true} className="p-6">
          <h2 className="text-xl font-family-heading text-ghost-white mb-4">
            Contract Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-silver-dust">Factory Contract:</span>
              <p className="text-ghost-white font-mono mt-1">
                {CONTRACT_ADDRESSES.factory}
              </p>
            </div>
            <div>
              <span className="text-silver-dust">Registry Contract:</span>
              <p className="text-ghost-white font-mono mt-1">
                {CONTRACT_ADDRESSES.registry}
              </p>
            </div>
          </div>
        </Card>

        {/* User Vault Information */}
        {vaults.length > 0 && (
          <Card glass={true} className="p-6">
            <h2 className="text-xl font-family-heading text-ghost-white mb-4">
              Your Vaults
            </h2>
            <div className="space-y-3">
              {vaults.map((vaultAddress, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-silver-dust text-sm">Vault #{index + 1}</span>
                    <p className="text-ghost-white font-mono">
                      {shortenAddress(vaultAddress, 8)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(vaultAddress);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Network Information */}
        <Card glass={true} className="p-6">
          <h2 className="text-xl font-family-heading text-ghost-white mb-4">
            Network Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-silver-dust">Network:</span>
              <span className="text-ghost-white">Lisk Sepolia</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-dust">Chain ID:</span>
              <span className="text-ghost-white">4202</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-dust">Block Explorer:</span>
              <a 
                href="https://sepolia-blockscout.lisk.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-soul-red hover:underline"
              >
                Blockscout
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
