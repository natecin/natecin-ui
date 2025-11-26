'use client';

import React, { useState } from 'react';
import { Image, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWalletERC721NFTs } from '../../hooks/useVaults';
import type { DepositAsset } from '../../lib/contracts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NFTSelectorProps {
  selectedNFTs: DepositAsset[];
  onNFTSelect: (nft: DepositAsset) => void;
  onNFTDeselect: (nft: DepositAsset) => void;
  maxSelection?: number;
}

export function NFTSelector({ 
  selectedNFTs, 
  onNFTSelect, 
  onNFTDeselect,
  maxSelection = 10 
}: NFTSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const { nfts, isLoading } = useWalletERC721NFTs();

  const isNFTSelected = (nft: DepositAsset) => {
    return selectedNFTs.some(selected => 
      selected.type === nft.type && 
      selected.tokenAddress === nft.tokenAddress && 
      selected.tokenId === nft.tokenId
    );
  };

  const toggleNFTSelection = (nft: DepositAsset) => {
    if (isNFTSelected(nft)) {
      onNFTDeselect(nft);
    } else if (selectedNFTs.length < maxSelection) {
      onNFTSelect(nft);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-silver-dust">
            NFTs to Include ({selectedNFTs.length}/{maxSelection})
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowSelector(!showSelector)}
          className="text-xs px-4 py-2"
        >
          {showSelector ? 'Hide' : 'Select'} NFTs
        </Button>
      </div>

      {/* Selected NFTs Preview */}
      {selectedNFTs.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedNFTs.map((nft, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => onNFTDeselect(nft)}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-soul-red/50">
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name || 'NFT'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-nft.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                    <Image className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-soul-red rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs text-silver-dust text-center mt-1">
                {nft.name || `#${nft.tokenId?.toString()}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFT Selector Modal */}
      {showSelector && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSelector(false)}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-charcoal rounded-xl border border-white/10 max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-family-heading text-ghost-white">
                  Select NFTs for Vault
                </h3>
                <Button
                  variant="secondary"
                  onClick={() => setShowSelector(false)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-silver-dust mt-2">
                Choose up to {maxSelection} NFTs to include in your inheritance vault
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soul-red"></div>
                </div>
              ) : nfts.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 text-silver-dust/50 mx-auto mb-4" />
                  <p className="text-silver-dust">No NFTs found in your wallet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nfts.map((nft, index) => {
                    const selected = isNFTSelected(nft);
                    const canSelect = selected || selectedNFTs.length < maxSelection;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => canSelect && toggleNFTSelection(nft)}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selected
                            ? 'border-soul-red shadow-lg shadow-soul-red/20'
                            : canSelect
                            ? 'border-white/10 hover:border-white/20'
                            : 'border-gray-700 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="aspect-square">
                          {nft.imageUrl ? (
                            <img
                              src={nft.imageUrl}
                              alt={nft.name || 'NFT'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-nft.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-purple-500/20 flex items-center justify-center">
                              <Image className="w-8 h-8 text-purple-400" />
                            </div>
                          )}
                        </div>

                        {/* Selection Overlay */}
                        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            selected
                              ? 'bg-soul-red border-soul-red'
                              : 'border-white'
                          }`}>
                            {selected && <Check className="w-5 h-5 text-white" />}
                          </div>
                        </div>

                        {/* NFT Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-xs text-white font-medium truncate">
                            {nft.name || `NFT #${nft.tokenId?.toString()}`}
                          </p>
                          <p className="text-xs text-silver-dust truncate">
                            {nft.collectionName || 'Unknown Collection'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-silver-dust">
                  {selectedNFTs.length} of {maxSelection} NFTs selected
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSelector(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowSelector(false)}
                    className="bg-soul-red hover:bg-soul-red/90"
                  >
                    Confirm Selection ({selectedNFTs.length})
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
