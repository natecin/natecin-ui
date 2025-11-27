"use client";

import React, { useEffect, useState, useRef } from "react";
import { Copy, LogOut, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useConnection, useConnect, useDisconnect } from "wagmi";
import { config } from "@/lib/wagmi";
import Link from "next/link";

interface NavbarProps {
  onConnectWallet?: () => void;
}

export function Navbar({ onConnectWallet }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const connection = useConnection();
  const address = connection.address;
  const isConnected = connection.isConnected;
  const { connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // Fix hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
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
        // Clear ALL wagmi-related localStorage to force fresh connection (only on client)
        if (mounted) {
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
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo with custom icon */}
        <div className="flex items-center gap-3 group">
          <Link href="/" className="flex">
            <img
              src="/natecin-icon.png"
              alt="NATECIN"
              className="w-8 h-8 transition-all duration-300 group-hover:scale-110"
            />
            <span className="text-2xl ml-2 font-family-heading text-ghost-white group-hover:text-soul-red transition-colors duration-300">
              NATECIN
            </span>
          </Link>

          {/* Logo glow on hover */}
          <div className="absolute -inset-2 bg-soul-red/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-silver-dust hover:text-ghost-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Connect Wallet button - Desktop only */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          <Button
            variant={isConnected ? "secondary" : "primary"}
            onClick={handleWalletAction}
            disabled={isConnecting}
            className={cn(
              "relative hover:animate-pulse-glow",
              isConnected &&
                "glass-enhanced border-white/20 hover:border-white/30"
            )}
          >
            <span className="relative z-10 flex items-center gap-2">
              {!mounted ? (
                "Connect Wallet"
              ) : isConnecting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
            <div className="absolute inset-0 bg-gradient-to-r from-soul-red/50 to-pulse-red/50 rounded blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </Button>

          {/* Dropdown menu */}
          {mounted && isConnected && showDropdown && (
            <div
              className="absolute right-0 rounded-lg overflow-hidden glass-enhanced border border-white/20 shadow-2xl"
              style={{
                position: "absolute",
                top: "100%",
                marginTop: "1rem",
                zIndex: 10000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 p-3 text-left text-ghost-white hover:bg-white/10 rounded-md transition-colors duration-200"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 p-3 text-left text-ghost-white hover:bg-white/10 rounded-md transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-enhanced border-b border-white/10">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Connect Wallet */}
            <div className="pt-4 border-t border-white/10">
              <Button
                variant="primary"
                onClick={handleWalletAction}
                disabled={isConnecting}
                className="w-full"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {!mounted ? (
                    "Connect Wallet"
                  ) : isConnecting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connecting...
                    </>
                  ) : isConnected && address ? (
                    formatAddress(address)
                  ) : (
                    "Connect Wallet"
                  )}
                </span>
              </Button>

              {/* Mobile dropdown menu */}
              {mounted && isConnected && showDropdown && (
                <div
                  className="mt-2 glass-enhanced border border-white/20 rounded-lg"
                  style={{
                    position: "absolute",
                    top: "100%",
                    zIndex: 10000,
                  }}
                >
                  <button
                    onClick={handleCopyAddress}
                    className="w-full flex items-center gap-3 p-3 text-left text-ghost-white hover:bg-white/10 rounded-t-md transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? "Copied!" : "Copy Address"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-white/10 rounded-b-md transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
