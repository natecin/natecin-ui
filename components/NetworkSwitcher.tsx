'use client';

import { useEffect, useRef, useState } from 'react';
import { useConnection, useChainId, useSwitchChain } from 'wagmi';
import { liskSepolia } from '@/lib/wagmi';

export function NetworkSwitcher() {
  const connection = useConnection();
  const isConnected = connection.isConnected;
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [hasSwitched, setHasSwitched] = useState(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setHasSwitched(false);
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && chainId && chainId !== liskSepolia.id && !hasSwitched && !isPending) {
      setHasSwitched(true);

      switchTimeoutRef.current = setTimeout(() => {
        switchChain(
          { chainId: liskSepolia.id },
          {
            onError: () => {
              setHasSwitched(false);
            },
          }
        );
      }, 1000);
    }

    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, [isConnected, chainId, hasSwitched, isPending]);

  
  if (isConnected && chainId !== liskSepolia.id && !isPending) {
    return (
      <div className="fixed top-20 left-0 right-0 z-40 bg-soul-red/90 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="text-ghost-white font-family-heading">
              ⚠️ Wrong Network - Please switch to <span className="font-bold">Lisk Sepolia</span>
            </p>
          </div>
          <button
            onClick={() => {
              setHasSwitched(true);
              switchChain(
                { chainId: liskSepolia.id },
                {
                  onError: () => setHasSwitched(false),
                }
              );
            }}
            disabled={isPending}
            className="px-4 py-2 bg-white text-soul-red rounded font-family-heading font-semibold hover:bg-ghost-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Switching...' : 'Switch to Lisk Sepolia'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
