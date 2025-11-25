'use client';

import React from 'react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Plus, Wallet, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Vault {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'executed';
  totalValue: number;
  heirs: number;
  daysRemaining: number;
  lastCheckIn: string;
}

const mockVaults: Vault[] = [
  {
    id: '1',
    name: 'Primary Vault',
    status: 'active',
    totalValue: 142850.0,
    heirs: 2,
    daysRemaining: 179,
    lastCheckIn: '2 days ago',
  },
  {
    id: '2',
    name: 'Emergency Vault',
    status: 'warning',
    totalValue: 25000.0,
    heirs: 1,
    daysRemaining: 15,
    lastCheckIn: '15 days ago',
  },
];

export default function Dashboard() {
  const statusColors = {
    active: 'text-green-500',
    warning: 'text-yellow-500',
    executed: 'text-gray-500',
  };

  const statusDots = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    executed: 'bg-gray-500',
  };

  const totalValue = mockVaults.reduce((sum, vault) => sum + vault.totalValue, 0);

  return (
    <div className="min-h-screen noise-texture pt-20">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-family-heading text-ghost-white mb-2">
              Your Vaults
            </h1>
            <p className="text-silver-dust">
              Manage your inheritance vaults and beneficiaries
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Vault
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-soul-red" />
              <span className="text-sm text-silver-dust">Total Value Locked</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {formatCurrency(totalValue)}
            </div>
          </Card>

          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-silver-dust">Active Vaults</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {mockVaults.filter(v => v.status === 'active').length}
            </div>
          </Card>

          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-pulse-red" />
              <span className="text-sm text-silver-dust">Total Beneficiaries</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {mockVaults.reduce((sum, v) => sum + v.heirs, 0)}
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          {mockVaults.map((vault) => (
            <Card key={vault.id} glass={true} className="p-6 hover:border-soul-red/50 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`relative flex h-3 w-3`}>
                      {vault.status === 'active' && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${statusDots[vault.status]}`}></span>
                    </span>
                    <h3 className="text-2xl font-family-heading text-ghost-white">
                      {vault.name}
                    </h3>
                    <span className={`text-sm ${statusColors[vault.status]} capitalize`}>
                      {vault.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-silver-dust">Value</div>
                      <div className="text-lg font-family-heading text-ghost-white">
                        {formatCurrency(vault.totalValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-silver-dust">Heirs</div>
                      <div className="text-lg font-family-heading text-ghost-white">
                        {vault.heirs}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-silver-dust">Days Remaining</div>
                      <div className={`text-lg font-family-heading ${
                        vault.daysRemaining < 30 ? 'text-yellow-500' : 'text-ghost-white'
                      }`}>
                        {vault.daysRemaining}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-silver-dust">Last Check-in</div>
                      <div className="text-lg font-family-heading text-ghost-white">
                        {vault.lastCheckIn}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-charcoal rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        vault.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-gradient-to-r from-soul-red to-pulse-red'
                      }`}
                      style={{
                        width: `${(vault.daysRemaining / 365) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  <Button variant="primary" className="w-full flex items-center justify-center gap-2 py-3">
                    <Heart className="w-4 h-4" />
                    I'm Alive
                  </Button>
                  <Button variant="secondary" className="w-full py-3">
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
