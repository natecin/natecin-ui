'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function CustomToggle({ 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false 
}: CustomToggleProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 glass-enhanced rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10">
      <div className="flex-1">
        <h3 className="text-lg font-family-heading text-ghost-white mb-1">
          {label}
        </h3>
        {description && (
          <p className="text-sm text-silver-dust">
            {description}
          </p>
        )}
      </div>
      
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`relative w-20 h-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-soul-red/20 ${
          checked ? 'bg-soul-red' : 'bg-charcoal border border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={`absolute top-1 w-8 h-8 rounded-full shadow-lg transition-all duration-300 ${
            checked ? 'left-10 bg-ghost-white' : 'left-1 bg-silver-dust'
          }`}
          animate={{
            x: checked ? 32 : 0,
            scale: isPressed ? 0.9 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
        
        {/* Glow effect when active */}
        {checked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-soul-red/30 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
      </motion.button>
    </div>
  );
}
