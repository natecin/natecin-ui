'use client';

import React, { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Beneficiary {
  id: string;
  address: string;
  percentage: number;
}

interface HeirManagerProps {
  heirs: Beneficiary[];
  onChange: (heirs: Beneficiary[]) => void;
}

export function HeirManager({ heirs, onChange }: HeirManagerProps) {
  const idCounterRef = useRef(heirs.length);
  const totalPercentage = heirs.reduce((sum, heir) => sum + heir.percentage, 0);
  const isValid = totalPercentage === 100;

  const addHeir = () => {
    idCounterRef.current += 1;
    const newHeir: Beneficiary = {
      id: `heir-${idCounterRef.current}`,
      address: '',
      percentage: 0,
    };
    onChange([...heirs, newHeir]);
  };

  const removeHeir = (id: string) => {
    onChange(heirs.filter((heir) => heir.id !== id));
  };

  const updateHeir = (id: string, field: 'address' | 'percentage', value: string | number) => {
    onChange(
      heirs.map((heir) =>
        heir.id === id ? { ...heir, [field]: value } : heir
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-family-heading text-ghost-white">Beneficiary Management</h3>
        <Button
          variant="secondary"
          onClick={addHeir}
          className="flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Beneficiary
        </Button>
      </div>

      <div className="space-y-4">
        {heirs.map((heir, index) => (
          <div
            key={heir.id}
            className="glass p-4 rounded space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-family-heading text-ghost-white">Beneficiary {index + 1}</span>
              {heirs.length > 1 && (
                <button
                  onClick={() => removeHeir(heir.id)}
                  className="text-pulse-red hover:text-pulse-red/80 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm text-silver-dust mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={heir.address}
                onChange={(e) => updateHeir(heir.id, 'address', e.target.value)}
                placeholder="0x..."
                className="w-full bg-charcoal border border-white/10 rounded px-4 py-3 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-silver-dust mb-2">
                Inheritance Percentage
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heir.percentage}
                  onChange={(e) =>
                    updateHeir(heir.id, 'percentage', parseInt(e.target.value))
                  }
                  className="flex-1 accent-soul-red"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={heir.percentage}
                  onChange={(e) =>
                    updateHeir(heir.id, 'percentage', parseInt(e.target.value) || 0)
                  }
                  className="w-20 bg-charcoal border border-white/10 rounded px-3 py-2 text-ghost-white text-center focus:border-soul-red focus:outline-none transition-colors"
                />
                <span className="text-silver-dust">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-4 rounded">
        <div className="flex items-center justify-between">
          <span className="font-family-heading text-ghost-white">Total Allocation</span>
          <span
            className={`text-2xl font-family-heading ${
              isValid
                ? 'text-green-500'
                : totalPercentage > 100
                ? 'text-pulse-red'
                : 'text-yellow-500'
            }`}
          >
            {totalPercentage}%
          </span>
        </div>
        {!isValid && (
          <p className="text-sm text-silver-dust mt-2">
            {totalPercentage > 100
              ? 'Total percentage exceeds 100%. Please adjust.'
              : 'Total percentage must equal 100%.'}
          </p>
        )}
      </div>
    </div>
  );
}
