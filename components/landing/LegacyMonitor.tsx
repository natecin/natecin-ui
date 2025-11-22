'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HeartbeatGraph } from '@/components/ui/HeartbeatGraph';
import { DonutChart } from '@/components/ui/DonutChart';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Lock } from 'lucide-react';

export function LegacyMonitor() {
  const totalValue = 142850.0;
  const daysRemaining = 179;

  return (
    <div className="relative -mt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Card className="relative z-10 border-2 border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pulse-red"></span>
              </span>
              <h2 className="font-heading text-ghost-white text-xl">
                Live Protocol Preview
              </h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                ● System Operational
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-silver-dust">Total Value Locked</div>
              <div className="text-2xl font-heading text-ghost-white">
                {formatCurrency(totalValue)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[70%_30%] gap-6">
            <div className="space-y-3 relative">
              <h3 className="font-heading text-ghost-white text-lg">
                Activity Monitor: Detecting Life Signs
              </h3>
              <div className="h-48 bg-charcoal rounded border border-white/5 relative">
                <HeartbeatGraph />
              </div>
            </div>

            <div className="space-y-3 relative">
              <h3 className="font-heading text-ghost-white text-lg">
                Smart Contract Auto-Distribution
              </h3>
              <div className="h-48">
                <DonutChart />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-sm text-silver-dust mb-2">
                  <span>Auto-execution timer</span>
                  <span className="font-heading text-ghost-white">
                    {daysRemaining} Days remaining
                  </span>
                </div>
                <div className="h-2 bg-charcoal rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-soul-red to-pulse-red rounded-full"
                    style={{ width: '51%' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-heading text-sm text-ghost-white">Audited Contract</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span className="font-heading text-sm text-ghost-white">Non-Custodial</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
