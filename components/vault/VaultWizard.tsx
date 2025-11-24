"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HeirManager } from "./HeirManager";
import { AssetDeposit } from "./AssetDeposit";
import { useAccount, useConnect } from "wagmi";
import { config } from "@/lib/wagmi";

interface VaultWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Heir {
  id: string;
  address: string;
  percentage: number;
}

export function VaultWizard({ isOpen, onClose }: VaultWizardProps) {
  const [step, setStep] = useState(1);
  const [heirs, setHeirs] = useState<Heir[]>([
    { id: "1", address: "", percentage: 100 },
  ]);
  const [inactivityPeriod, setInactivityPeriod] = useState("180");
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  const totalSteps = 3;
  const totalPercentage = heirs.reduce((sum, heir) => sum + heir.percentage, 0);
  const canProceed =
    step === 1
      ? totalPercentage === 100 && heirs.every((h) => h.address)
      : true;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConnectWallet = () => {
    const metaMaskConnector = config.connectors[0];
    connect({ connector: metaMaskConnector });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-hidden"
          >
            <Card
              glass={false}
              className="relative w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-silver-dust hover:text-ghost-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header - Fixed */}
              <div className="p-8 pb-4 shrink-0">
                <h2 className="text-3xl font-family-heading text-ghost-white mb-2">
                  Create Your Vault
                </h2>
                <div className="flex items-center gap-2 mt-4">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full transition-colors ${
                        i + 1 <= step ? "bg-soul-red" : "bg-charcoal"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-silver-dust mt-2">
                  Step {step} of {totalSteps}
                </p>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-6">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {!isConnected ? (
                      <div className="text-center py-12 space-y-4">
                        <h3 className="text-xl font-family-heading text-ghost-white">
                          Connect Your Wallet
                        </h3>
                        <p className="text-silver-dust mb-6">
                          Connect your wallet to start creating your vault
                        </p>
                        <Button onClick={handleConnectWallet}>
                          Connect Wallet
                        </Button>
                      </div>
                    ) : (
                      <>
                        <HeirManager heirs={heirs} onChange={setHeirs} />

                        <div className="space-y-3">
                          <label className="block text-sm text-silver-dust">
                            Inactivity Period
                          </label>
                          <select
                            value={inactivityPeriod}
                            onChange={(e) =>
                              setInactivityPeriod(e.target.value)
                            }
                            className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white focus:border-soul-red focus:outline-none transition-colors"
                          >
                            <option value="30">30 Days</option>
                            <option value="180">6 Months</option>
                            <option value="365">1 Year</option>
                            <option value="custom">Custom</option>
                          </select>
                          <p className="text-sm text-silver-dust">
                            Time before vault executes if you don't check in
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <AssetDeposit />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-family-heading text-ghost-white">
                      Review & Confirm
                    </h3>

                    <Card glass={false} className="space-y-4">
                      <div>
                        <div className="text-sm text-silver-dust">Heirs</div>
                        <div className="text-ghost-white font-family-heading">
                          {heirs.length} beneficiar
                          {heirs.length === 1 ? "y" : "ies"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-silver-dust">
                          Inactivity Period
                        </div>
                        <div className="text-ghost-white font-family-heading">
                          {inactivityPeriod} days
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-silver-dust">
                          Initial Deposit
                        </div>
                        <div className="text-ghost-white font-family-heading">
                          Ready to deposit
                        </div>
                      </div>
                    </Card>

                    <div className="glass p-4 rounded">
                      <p className="text-sm text-silver-dust">
                        By creating this vault, you agree that the smart
                        contract will automatically execute and transfer assets
                        to your designated heirs after the specified inactivity
                        period, unless you check in.
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        alert("Vault created successfully!");
                        onClose();
                      }}
                    >
                      Create Vault
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Pagination - Sticky Footer */}
              {isConnected && (
                <div className="flex items-center justify-between px-8 py-6 border-t border-white/10 shrink-0 bg-charcoal/95 backdrop-blur-sm">
                  <Button
                    variant="secondary"
                    onClick={handlePrevious}
                    disabled={step === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>

                  {step < totalSteps && (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
