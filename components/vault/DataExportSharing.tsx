'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Copy, 
  QrCode, 
  ExternalLink,
  FileText,
  BarChart,
  Twitter,
  MessageCircle,
  Mail,
  Check
} from 'lucide-react';
import { 
  formatEtherValue,
  copyAddressToClipboard,
  formatDateFromTimestamp,
  calculateVaultAge
} from '@/lib/contracts/utils';
import { type VaultSummary } from '@/lib/contracts';

interface DataExportSharingProps {
  summary: VaultSummary;
  isOwner?: boolean;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export function DataExportSharing({ summary, isOwner }: DataExportSharingProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [showQRCode, setShowQRCode] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const generateVaultReport = () => {
    setExportStatus('generating');
    
    // Simulate report generation
    setTimeout(() => {
      const reportData = {
        vaultAddress: summary.vault,
        ownerAddress: summary.owner,
        beneficiaryAddress: summary.heir,
        createdAt: formatDateFromTimestamp(summary.lastActiveTimestamp),
        lastActivity: formatDateFromTimestamp(summary.lastActiveTimestamp),
        vaultAge: calculateVaultAge(summary.lastActiveTimestamp),
        inactivityPeriod: summary.inactivityPeriod,
        status: summary.executed ? 'Executed' : 'Active',
        ethBalance: formatEtherValue(summary.ethBalance),
        erc20Count: summary.erc20Count,
        erc721Count: summary.erc721Count,
        erc1155Count: summary.erc1155Count,
        totalValue: formatEtherValue(summary.ethBalance), // In production, calculate actual USD value
        canDistribute: summary.canDistribute
      };

      // Create CSV content
      const csvContent = Object.entries(reportData)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');

      // Download as CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vault-report-${summary.vault?.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    }, 1500);
  };

  const generatePDFReport = () => {
    setExportStatus('generating');
    
    // Simulate PDF generation
    setTimeout(() => {
      // In a real implementation, you'd use a PDF library like jsPDF
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
      
      // For now, just open a new window with print-friendly view
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Vault Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
              </style>
            </head>
            <body>
              <h1>Vault Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <table>
                <tr><th>Property</th><th>Value</th></tr>
                <tr><td>Vault Address</td><td>${summary.vault}</td></tr>
                <tr><td>Owner</td><td>${summary.owner}</td></tr>
                <tr><td>Beneficiary</td><td>${summary.heir}</td></tr>
                <tr><td>Status</td><td>${summary.executed ? 'Executed' : 'Active'}</td></tr>
                <tr><td>ETH Balance</td><td>${formatEtherValue(summary.ethBalance)} ETH</td></tr>
                <tr><td>Created</td><td>${formatDateFromTimestamp(summary.lastActiveTimestamp)}</td></tr>
              </table>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }, 1500);
  };

  const copyVaultAddress = async () => {
    if (!summary.vault) return;
    const success = await copyAddressToClipboard(summary.vault);
    if (success) {
      setCopiedText('Vault Address');
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const getShareOptions = (): ShareOption[] => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const vaultUrl = `${baseUrl}/dashboard/vault/${summary.vault}`;
    
    const shareMessage = `Check out this vault on NateCin: ${formatEtherValue(summary.ethBalance)} ETH locked with ${summary.inactivityPeriod}s inactivity period`;
    
    return [
      {
        id: 'copy-link',
        label: 'Copy Link',
        icon: <Copy className="w-4 h-4" />,
        action: async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: 'Vault Details',
                text: shareMessage,
                url: vaultUrl
              });
            } catch (err) {
              // Fallback to copying link
              await navigator.clipboard.writeText(vaultUrl);
              setCopiedText('Vault Link');
              setTimeout(() => setCopiedText(null), 2000);
            }
          } else {
            await navigator.clipboard.writeText(vaultUrl);
            setCopiedText('Vault Link');
            setTimeout(() => setCopiedText(null), 2000);
          }
        },
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      },
      {
        id: 'twitter',
        label: 'Twitter',
        icon: <Twitter className="w-4 h-4" />,
        action: () => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage + ' ' + vaultUrl)}`, '_blank');
        },
        color: 'bg-sky-500/10 border-sky-500/20 text-sky-400'
      },
      {
        id: 'telegram',
        label: 'Telegram',
        icon: <MessageCircle className="w-4 h-4" />,
        action: () => {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(vaultUrl)}&text=${encodeURIComponent(shareMessage)}`, '_blank');
        },
        color: 'bg-blue-400/10 border-blue-400/20 text-blue-400'
      },
      {
        id: 'email',
        label: 'Email',
        icon: <Mail className="w-4 h-4" />,
        action: () => {
          const subject = 'Vault Details';
          const body = `${shareMessage}\n\nView details: ${vaultUrl}`;
          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        },
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
      }
    ];
  };

  return (
    <Card glass={true} className="border border-white/20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Share2 className="w-4 h-4 text-soul-red" />
          <h3 className="text-sm font-family-heading text-ghost-white">
            Export & Share
          </h3>
        </div>

        {/* Export Options */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-ghost-white mb-3">Export Data</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={generateVaultReport}
              disabled={exportStatus === 'generating'}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                {exportStatus === 'generating' ? 'Generating...' : 
                 exportStatus === 'success' ? 'Exported!' : 'Export CSV'}
              </span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={generatePDFReport}
              disabled={exportStatus === 'generating'}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>
                {exportStatus === 'generating' ? 'Generating...' : 
                 exportStatus === 'success' ? 'Exported!' : 'Export PDF'}
              </span>
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-ghost-white mb-3">Vault QR Code</h4>
          
          <div className="p-4 bg-charcoal/50 rounded-lg border border-white/5">
            {showQRCode ? (
              <div className="text-center">
                {/* In production, you'd use a QR code library like qrcode */}
                <div className="w-32 h-32 bg-white mx-auto mb-3 rounded flex items-center justify-center">
                  <span className="text-black text-xs">QR Code</span>
                </div>
                <p className="text-xs text-silver-dust mb-3">
                  Scan to view vault details
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQRCode(false)}
                >
                  Hide QR Code
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="w-12 h-12 text-silver-dust mx-auto mb-3" />
                <p className="text-xs text-silver-dust mb-3">
                  Generate QR code for easy sharing
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowQRCode(true)}
                >
                  Generate QR Code
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-ghost-white mb-3">Share Vault</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getShareOptions().map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={option.action}
                className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${option.color}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  {option.icon}
                  <span className="text-xs">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-xs font-medium text-ghost-white mb-3">Quick Actions</h4>
          
          <div className="space-y-2">
            <button
              onClick={copyVaultAddress}
              className="w-full p-3 bg-charcoal/50 rounded-lg border border-white/5 text-left flex items-center justify-between hover:bg-charcoal/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Copy className="w-4 h-4 text-silver-dust" />
                <div>
                  <p className="text-sm text-ghost-white">Copy Vault Address</p>
                  <p className="text-xs text-silver-dust">
                    {summary.vault?.slice(0, 8)}...{summary.vault?.slice(-6)}
                  </p>
                </div>
              </div>
              {copiedText === 'Vault Address' && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            
            <button
              onClick={() => window.open(`https://etherscan.io/address/${summary.vault}`, '_blank')}
              className="w-full p-3 bg-charcoal/50 rounded-lg border border-white/5 text-left flex items-center gap-3 hover:bg-charcoal/70 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-silver-dust" />
              <div>
                <p className="text-sm text-ghost-white">View on Etherscan</p>
                <p className="text-xs text-silver-dust">Explore contract details</p>
              </div>
            </button>
          </div>
        </div>

        {/* Success Message */}
        {copiedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">
                {copiedText} copied to clipboard!
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
