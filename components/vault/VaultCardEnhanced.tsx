"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConnection } from "wagmi";
import {
  useVaultSummary,
  useCanDistribute,
  useDepositETH,
  useUpdateActivity,
} from "../../hooks/useVaults";
import {
  formatEtherValue,
  formatTimeUntilDistribution,
  calculateVaultAge,
  shortenAddress,
  formatDateFromTimestamp,
} from "../../lib/contracts/utils";
import type { VaultCardProps } from "../../lib/contracts/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Lock,
  Heart,
  Plus,
  Wallet,
  Clock,
  TrendingUp,
  Settings,
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
}

export function VaultCardEnhanced({
  vaultAddress,
  showActions = true,
  onDeposit,
  onUpdate,
  onDistribute,
}: VaultCardProps) {
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error } = useVaultSummary(vaultAddress);
  const { canDistribute } = useCanDistribute(vaultAddress);
  const { deposit, isLoading: isDepositing } = useDepositETH();
  const { updateActivity, isLoading: isUpdating } = useUpdateActivity();
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const heartbeatRef = useRef<HTMLCanvasElement>(null);

  const [depositAmount, setDepositAmount] = useState("0.1");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isOwner =
    address && summary?.owner?.toLowerCase() === address?.toLowerCase();

  // Floating particles animation
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Particle[] = [];
    const particleCount = 10; // Reduced count for performance

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulsePhase += 0.02;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Clamp position
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Pulsing effect
        const pulse = Math.sin(particle.pulsePhase) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * pulse;

        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        const color = summary?.executed
          ? "107, 114, 128"
          : canDistribute
          ? "250, 204, 21"
          : "193, 26, 41";
        gradient.addColorStop(0, `rgba(${color}, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(${color}, ${currentOpacity * 1.5})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            const color = summary?.executed
              ? "107, 114, 128"
              : canDistribute
              ? "250, 204, 21"
              : "193, 26, 41";
            ctx.strokeStyle = `rgba(${color}, ${0.05 * (1 - distance / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [summary?.executed, canDistribute]);

  // Heartbeat animation
  useEffect(() => {
    const canvas = heartbeatRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const heartbeatPattern = [
      0, 0, 0, 0, 0, 0.1, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.85, 0.15, 0,
      -0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0,
    ];

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = "#1A1A1F";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      const color = summary?.executed
        ? "107, 114, 128"
        : canDistribute
        ? "250, 204, 21"
        : "255, 46, 59";
      ctx.strokeStyle = `rgb(${color})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgb(${color})`;
      ctx.beginPath();

      const segments = width / 2;
      for (let i = 0; i < segments; i++) {
        const x = (i / segments) * width;
        const patternIndex = Math.floor((i + offset) % heartbeatPattern.length);
        const y = centerY - heartbeatPattern[patternIndex] * (height * 0.35);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += 0.5;
      if (offset >= heartbeatPattern.length) {
        offset = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [summary?.executed, canDistribute]);

  const handleDeposit = async () => {
    try {
      await deposit(vaultAddress, depositAmount);
      setShowDepositForm(false);
      setDepositAmount("0.1");
      onDeposit?.(vaultAddress);
    } catch (err) {
      console.error("Deposit failed:", err);
    }
  };

  const handleUpdateActivity = async () => {
    try {
      await updateActivity(vaultAddress);
      onUpdate?.(vaultAddress);
    } catch (err) {
      console.error("Update activity failed:", err);
    }
  };

  const handleDistribute = async () => {
    onDistribute?.(vaultAddress);
  };

  if (isLoading) {
    return (
      <Card className="relative border-2 border-white/20 overflow-hidden">
        <canvas
          ref={particlesRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        />
        <div className="relative z-10 p-6">
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
      <Card className="relative border-2 border-white/20 overflow-hidden border-red-500/50">
        <canvas
          ref={particlesRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        />
        <div className="relative z-10 p-6">
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

  console.log(summary);

  // Generate asset distribution data
  const totalAssets =
    summary.erc20Count + summary.erc721Count + summary.erc1155Count;
  const assetDistribution = [
    {
      name: "ERC20",
      value:
        totalAssets > 0
          ? Math.round((summary.erc20Count / totalAssets) * 100)
          : 100,
      color:
        statusColor === "gray"
          ? "#6B7280"
          : statusColor === "yellow"
          ? "#FACC15"
          : "#C11A29",
    },
    {
      name: "ERC721",
      value:
        totalAssets > 0
          ? Math.round((summary.erc721Count / totalAssets) * 100)
          : 0,
      color:
        statusColor === "gray"
          ? "#9CA3AF"
          : statusColor === "yellow"
          ? "#FDE047"
          : "#FF2E3B",
    },
    {
      name: "ERC1155",
      value:
        totalAssets > 0
          ? Math.round((summary.erc1155Count / totalAssets) * 100)
          : 0,
      color:
        statusColor === "gray"
          ? "#D1D5DB"
          : statusColor === "yellow"
          ? "#FEF08A"
          : "#FF6B6B",
    },
  ];

  return (
    <Card className="relative border-2 border-white/20 overflow-hidden hover:border-soul-red/50 transition-all duration-300">
      {/* Floating particles background */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
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
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-auto text-silver-dust hover:text-ghost-white transition-colors p-1"
              >
                <Settings className="w-4 h-4" />
              </button>
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
            <div className="text-right">
              <div className="text-sm text-silver-dust">Total Value</div>
              <div className="text-2xl font-family-heading text-ghost-white">
                {formatEtherValue(summary?.ethBalance)} ETH
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && isOwner && !summary.executed && (
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                variant="primary"
                className="flex items-center gap-2"
                onClick={() => setShowDepositForm(!showDepositForm)}
              >
                <Plus className="w-4 h-4" />
                Deposit
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleUpdateActivity}
                disabled={isUpdating}
              >
                <Heart className="w-4 h-4" />
                {isUpdating ? "Updating..." : "I'm Alive"}
              </Button>
              {canDistribute && onDistribute && (
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDistribute}
                >
                  Distribute
                </Button>
              )}
            </div>
          )}

          {summary.executed && (
            <div className="mb-6">
              <Button variant="secondary" disabled>
                Already Distributed
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-[60%_40%] gap-6">
            <div className="space-y-3 relative">
              <h4 className="font-family-heading text-ghost-white text-sm">
                Activity Monitor:{" "}
                {statusText === "Active" ? "Life Signs Detected" : statusText}
              </h4>
              <div className="h-32 bg-charcoal rounded border border-white/5 relative overflow-hidden">
                {/* 3D depth effect */}
                <div
                  className={`absolute inset-0 ${
                    statusColor === "gray"
                      ? "bg-gradient-to-br from-gray-500/5 via-transparent to-gray-400/5"
                      : statusColor === "yellow"
                      ? "bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-400/5"
                      : "bg-gradient-to-br from-soul-red/5 via-transparent to-pulse-red/5"
                  } pointer-events-none`}
                />
                <canvas
                  ref={heartbeatRef}
                  className="w-full h-full"
                  width={400}
                  height={128}
                />
              </div>
            </div>

            <div className="space-y-3 relative">
              <h4 className="font-family-heading text-ghost-white text-sm">
                Asset Distribution
              </h4>
              <div className="h-32 relative overflow-hidden rounded border border-white/5">
                {/* 3D depth effect */}
                <div
                  className={`absolute inset-0 ${
                    statusColor === "gray"
                      ? "bg-gradient-to-br from-gray-500/5 via-transparent to-gray-400/5"
                      : statusColor === "yellow"
                      ? "bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-400/5"
                      : "bg-gradient-to-br from-neon-purple/5 via-transparent to-soul-red/5"
                  } pointer-events-none`}
                />
                <div className="p-4 h-full flex flex-col justify-center">
                  <div className="space-y-2">
                    {assetDistribution.map((asset, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="text-xs text-silver-dust">
                          {asset.name}: {asset.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!summary.executed && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-sm text-silver-dust mb-2">
                    <span>Auto-execution timer</span>
                    <span className="font-family-heading text-ghost-white">
                      {formatTimeUntilDistribution(
                        summary.timeUntilDistribution
                      )}
                    </span>
                  </div>
                  {/* Enhanced progress bar with particle trail */}
                  <div className="relative h-3 bg-charcoal rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full relative overflow-hidden ${
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
                    >
                      {/* Particle trail effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                      {/* Pulsing end indicator */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/40 animate-pulse-glow" />
                    </div>

                    {/* Background shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-silver-dust flex-col">
                  <div className="w-full flex space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Audited</span>
                  </div>
                  <div className="w-full flex space-x-1">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Non-Custodial</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expand/Collapse Details Section */}
          {!isCollapsed && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-6">
              <div>
                <div className="text-silver-dust">Owner</div>
                <div className="font-family-heading text-ghost-white">
                  {shortenAddress(summary.owner, 6)}
                </div>
              </div>
              <div>
                <div className="text-silver-dust">Beneficiaries</div>
                <div className="font-family-heading text-ghost-white">
                  {/* Handle both single and multiple heirs */}
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
          )}
        </div>

        {showDepositForm && isOwner && (
          <div className="px-6 pb-6 border-t border-white/10">
            <div className="pt-4">
              <div className="bg-charcoal rounded p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    step="0.001"
                    min="0.001"
                    placeholder="Amount (ETH)"
                    className="flex-1 bg-charcoal border border-white/10 rounded px-3 py-2 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none transition-colors"
                  />
                  <Button
                    onClick={handleDeposit}
                    disabled={
                      isDepositing ||
                      !depositAmount ||
                      parseFloat(depositAmount) <= 0
                    }
                    className="px-4"
                  >
                    {isDepositing ? "Depositing..." : "Deposit"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDepositForm(false)}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {summary.executed && (
          <div className="px-6 pb-6 border-t border-white/10">
            <div className="pt-4">
              <p className="text-silver-dust">
                This vault has been distributed to the heir.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
