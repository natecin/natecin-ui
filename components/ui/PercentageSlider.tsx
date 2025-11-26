'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PercentageSliderProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  heirIndex?: number;
  totalHeirs?: number;
  remainingPercentage?: number;
  error?: string;
}

export function PercentageSlider({
  value,
  onChange,
  max = 100,
  label,
  heirIndex,
  totalHeirs = 1,
  remainingPercentage = 100,
  error
}: PercentageSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(max, Math.max(0, parseInt(e.target.value) || 0));
    onChange(newValue);
  }, [max, onChange]);

  const getBarColor = () => {
    if (error) return 'bg-pulse-red';
    if (value > 100 - remainingPercentage && value > 0) return 'bg-green-500';
    return 'bg-soul-red';
  };

  const getBarWidth = () => {
    const width = (value / max) * 100;
    return Math.min(width, 100);
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-silver-dust">
            {label}
          </label>
          <span className={`text-sm ${error ? 'text-pulse-red' : 'text-ghost-white'}`}>
            {value}%
          </span>
        </div>
      )}
      
      {/* Visual Percentage Bar */}
      <div className="relative">
        <div className="w-full h-6 bg-charcoal/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className={`h-full ${getBarColor()} transition-all duration-300 relative`}
            initial={{ width: 0 }}
            animate={{ width: `${getBarWidth()}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
          
          {/* Remaining indicator */}
          {remainingPercentage > 0 && !isDragging && (
            <motion.div
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-silver-dust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {remainingPercentage}% left
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Slider and Number Input */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="range"
            min="0"
            max={max}
            value={value}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`w-full h-2 bg-transparent appearance-none cursor-pointer slider-custom ${
              error ? 'accent-pulse-red' : 'accent-soul-red'
            }`}
            style={{
              background: 'transparent',
            }}
          />
          
          {/* Custom thumb styling */}
          <style jsx>{`
            .slider-custom::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              background: ${error ? '#FF2E3B' : '#C11A29'};
              cursor: pointer;
              border-radius: 50%;
              border: 2px solid #F8F9FA;
              box-shadow: 0 0 10px rgba(193, 26, 41, 0.5);
              transition: all 0.2s ease;
            }
            
            .slider-custom::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 0 20px rgba(193, 26, 41, 0.8);
            }
            
            .slider-custom::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: ${error ? '#FF2E3B' : '#C11A29'};
              cursor: pointer;
              border-radius: 50%;
              border: 2px solid #F8F9FA;
              box-shadow: 0 0 10px rgba(193, 26, 41, 0.5);
              transition: all 0.2s ease;
            }
            
            .slider-custom::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 0 20px rgba(193, 26, 41, 0.8);
            }
          `}</style>
        </div>
        
        {/* Number Input */}
        <div className="relative">
          <input
            type="number"
            min="0"
            max={max}
            value={value}
            onChange={handleNumberChange}
            className={`w-20 h-10 bg-charcoal border text-center text-ghost-white rounded-lg transition-all duration-200 ${
              error 
                ? 'border-pulse-red focus:border-pulse-red' 
                : 'border-white/20 focus:border-soul-red'
            } focus:outline-none focus:ring-2 focus:ring-soul-red/20`}
          />
          <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-sm text-silver-dust">
            %
          </span>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.p
          className="text-sm text-pulse-red"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {/* Tooltip */}
      {showTooltip && !error && (
        <motion.div
          className="absolute z-10 px-3 py-2 bg-charcoal border border-white/20 rounded-lg text-xs text-ghost-white shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Drag to adjust percentage
        </motion.div>
      )}
    </div>
  );
}
