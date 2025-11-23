"use client";

import React, { useEffect, useState, useRef } from "react";
import { HeartPulse, Copy, LogOut } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { config } from "@/lib/wagmi";

interface NavbarProps {
  onConnectWallet?: () => void;
}

export function Navbar({ onConnectWallet }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { address, isConnected } = useAccount();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // Fix hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWalletAction = async () => {
    // Prevent action if already connecting
    if (isConnecting) return;

    if (isConnected) {
      setShowDropdown(!showDropdown);
    } else {
      try {
        // Clear ALL wagmi-related localStorage to force fresh connection
        if (typeof window !== 'undefined') {
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith('wagmi') || key.includes('wagmi')) {
              localStorage.removeItem(key);
            }
          });
        }

        // Get MetaMask connector from config (avoids Coinbase/other wallet conflicts)
        const metaMaskConnector = config.connectors[0];

        // Connect with async/await pattern
        await connectAsync({ connector: metaMaskConnector });
        onConnectWallet?.();
      } catch (error: any) {
        // Silently handle connection errors
      }
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    disconnect();
  };

  // Reset dropdown when disconnected
  useEffect(() => {
    if (!isConnected) {
      setShowDropdown(false);
    }
  }, [isConnected]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-enhanced backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with heartbeat pulse */}
        <div className="flex items-center gap-3 group">
          <HeartPulse className="w-8 h-8 text-soul-red animate-heartbeat group-hover:text-pulse-red transition-colors" />
          <span className="text-2xl font-heading text-ghost-white group-hover:text-soul-red transition-colors duration-300">
            NATECIN
          </span>

          {/* Logo glow on hover */}
          <div className="absolute -inset-2 bg-soul-red/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "About"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-silver-dust hover:text-ghost-white transition-colors duration-200 relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-soul-red to-pulse-red group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Connect Wallet button with enhanced glow */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="primary"
            onClick={handleWalletAction}
            disabled={isConnecting}
            className="relative animate-pulse-glow hover:animate-pulse-glow"
          >
            <span className="relative z-10 flex items-center gap-2">
              {!mounted ? (
                "Connect Wallet"
              ) : isConnecting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : isConnected && address ? (
                formatAddress(address)
              ) : (
                "Connect Wallet"
              )}
            </span>

            {/* Button glow backdrop */}
            <div className="absolute inset-0 bg-linear-to-r from-soul-red/50 to-pulse-red/50 rounded blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </Button>

          {/* Dropdown menu */}
          {mounted && isConnected && showDropdown && (
            <div
              className="absolute right-0 w-56 rounded-lg overflow-hidden"
              style={{
                top: '100%',
                marginTop: '8px',
                zIndex: 10000,
                backgroundColor: 'rgba(30, 30, 30, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '8px' }}>
                <button
                  onClick={handleCopyAddress}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: '#F5F5F5',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: '#DC2626',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animated bottom border */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-soul-red to-transparent" />
      )}
    </nav>
  );
}
