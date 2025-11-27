"use client";

import React, { useState, useEffect } from "react";
import { useConnection } from "wagmi";
import { useVaultSummary, useCanDistribute } from "../../hooks/useVaults";
import {
  formatEtherValue,
  formatTimeUntilDistribution,
  calculateVaultAge,
  shortenAddress,
} from "../../lib/contracts/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

interface VaultCardSimpleProps {
  vaultAddress: string;
}

export function VaultCardSimple({ vaultAddress }: VaultCardSimpleProps) {
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error } = useVaultSummary(vaultAddress as `0x${string}`);
  const { canDistribute } = useCanDistribute(vaultAddress as `0x${string}`);

  const isOwner =
    address && summary?.owner?.toLowerCase() === address?.toLowerCase();

  if (isLoading) {
    return (
      <Card className="border-2 border-white/20">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-white/20 border-red-500/50">
        <div className="p-6">
          <p className="text-red-400">Error loading vault: {error.message}</p>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const vaultAge = calculateVaultAge(summary.lastActiveTimestamp);
  const statusColor = summary.executed
    ? "gray"
    : canDistribute
    ? "yellow"
    : "red";
  const statusText = summary.executed
    ? "Distributed"
    : canDistribute
    ? "Ready for Distribution"
    : "Active";

  const totalAssets = summary.erc20Count + summary.erc721Count + summary.erc1155Count;

  return (
    <Card className="border-2 border-white/20 hover:border-soul-red/50 transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
          <div className="flex items-center gap-3 mb-4 lg:mb-0">
            <span className="relative flex h-3 w-3">
              {statusText === "Active" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  statusColor === "gray"
                    ? "bg-gray-500"
                    : statusColor === "yellow"
                    ? "bg-yellow-500"
                    : "bg-pulse-red"
                }`}
              ></span>
            </span>
            <h3 className="font-family-heading text-ghost-white text-xl">
              Vault {shortenAddress(vaultAddress, 8)}
            </h3>
            <span
              className={`px-3 py-1 rounded-full ${
                statusColor === "gray"
                  ? "bg-gray-500/10 border border-gray-500/20 text-gray-400"
                  : statusColor === "yellow"
                  ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              } text-xs font-medium`}
            >
              ● {statusText}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-silver-dust">Total Value</div>
              <div className="text-2xl font-family-heading text-ghost-white">
                {formatEtherValue(summary?.ethBalance)} ETH
              </div>
            </div>
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => {
                window.location.href = `/dashboard/vault/${vaultAddress}`;
              }}
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-silver-dust">Owner</div>
            <div className="font-family-heading text-ghost-white">
              {shortenAddress(summary.owner, 6)}
            </div>
          </div>
          <div>
            <div className="text-silver-dust">Beneficiaries</div>
            <div className="font-family-heading text-ghost-white">
              {summary.heir 
                ? `${shortenAddress(summary.heir, 6)} (100%)`
                : 'No beneficiaries set'
              }
            </div>
          </div>
          <div>
            <div className="text-silver-dust">Assets</div>
            <div className="font-family-heading text-ghost-white">
              {totalAssets}
            </div>
          </div>
          <div>
            <div className="text-silver-dust">Age</div>
            <div className="font-family-heading text-ghost-white">
              {vaultAge}
            </div>
          </div>
        </div>

        {!summary.executed && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm text-silver-dust mb-2">
              <span>Auto-execution timer</span>
              <span className="font-family-heading text-ghost-white">
                {formatTimeUntilDistribution(
                  summary.timeUntilDistribution
                )}
              </span>
            </div>
            <div className="h-3 bg-charcoal rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full ${
                  statusColor === "yellow"
                    ? "bg-yellow-500"
                    : "bg-gradient-to-r from-soul-red to-pulse-red"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (Number(summary.timeUntilDistribution) /
                      (Number(summary.inactivityPeriod) * 1000)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
