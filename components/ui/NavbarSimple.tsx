"use client";

import React, { useEffect, useState, useRef } from "react";
import { Copy, LogOut, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { useConnection, useConnect, useDisconnect } from "wagmi";
import { config } from "@/lib/wagmi";

interface NavbarSimpleProps {
  onConnectWallet?: () => void;
}

export function NavbarSimple({ onConnectWallet }: NavbarSimpleProps) {
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
    if (isConnecting) return;

    if (isConnected) {
      setShowDropdown(!showDropdown);
    } else {
      try {
        if (mounted) {
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith('wagmi') || key.includes('wagmi')) {
              localStorage.removeItem(key);
            }
          });
        }

        const metaMaskConnector = config.connectors[0];
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

  useEffect(() => {
    if (!isConnected) {
      setShowDropdown(false);
    }
  }, [isConnected]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-onyx border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/natecin-icon.png" 
            alt="NATECIN" 
            className="w-7 h-7"
          />
          <span className="text-xl font-semibold text-ghost-white">
            NATECIN
          </span>
        </div>

        {/* Navigation links - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/"
            className="text-gray-400 hover:text-ghost-white transition-colors"
          >
            Home
          </a>
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-ghost-white transition-colors"
          >
            Dashboard
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-gray-400 hover:text-ghost-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Connect Wallet button - Desktop only */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          <Button
            variant="primary"
            onClick={handleWalletAction}
            disabled={isConnecting}
            className="bg-soul-red hover:bg-soul-red/90"
          >
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
          </Button>

          {/* Dropdown menu */}
          {mounted && isConnected && showDropdown && (
            <div
              className="absolute right-0 w-56 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shadow-lg"
              style={{ 
                top: '100%',
                zIndex: 10000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2">
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 p-3 text-left text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 p-3 text-left text-red-500 hover:bg-gray-800 rounded-md transition-colors"
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800">
          <div className="px-4 py-6 space-y-4">
            <a
              href="/"
              className="block text-gray-400 hover:text-ghost-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/dashboard"
              className="block text-gray-400 hover:text-ghost-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            
            {/* Mobile Connect Wallet */}
            <div className="pt-4 border-t border-gray-800">
              <Button
                variant="primary"
                onClick={handleWalletAction}
                disabled={isConnecting}
                className="w-full bg-soul-red hover:bg-soul-red/90"
              >
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
              </Button>
              
              {/* Mobile dropdown menu */}
              {mounted && isConnected && showDropdown && (
                <div 
                  className="bg-gray-800 border border-gray-700 rounded-lg"
                  style={{ 
                    position: 'absolute',
                    top: '100%',
                    zIndex: 10000
                  }}
                >
                  <button
                    onClick={handleCopyAddress}
                    className="w-full flex items-center gap-3 p-3 text-left text-gray-200 hover:bg-gray-700 rounded-t-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? "Copied!" : "Copy Address"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 p-3 text-left text-red-500 hover:bg-gray-700 rounded-b-md transition-colors"
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
