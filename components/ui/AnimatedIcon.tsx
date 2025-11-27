'use client';

import React, { useState, useEffect } from 'react';
import { LucideIcon, Shield, Lock, Heart, Vault, Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  icon: LucideIcon;
  type?: 'pulse' | 'shake' | 'rotate' | 'bounce' | 'glow' | 'float' | 'heartbeat' | 'shield' | 'lock' | 'vault' | 'sparkle';
  size?: number;
  className?: string;
  color?: string;
  onClick?: () => void;
  delay?: number;
}

export function AnimatedIcon({ 
  icon: Icon, 
  type = 'pulse', 
  size = 24, 
  className = '', 
  color = 'currentColor',
  onClick,
  delay = 0
}: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getAnimation = () => {
    switch (type) {
      case 'pulse':
        return {
          initial: { scale: 1 },
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      
      case 'heartbeat':
        return {
          initial: { scale: 1 },
          animate: { scale: [1, 1.2, 1, 1.2, 1] },
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        };
      
      case 'shield':
        return {
          initial: { rotate: 0 },
          animate: { 
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1]
          },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      
      case 'lock':
        return {
          initial: { rotate: 0 },
          animate: isHovered ? { 
            rotate: [0, -10, 10, 0],
            scale: 1.1
          } : { rotate: 0, scale: 1 },
          transition: { duration: 0.5 }
        };
      
      case 'vault':
        return {
          initial: { rotateY: 0 },
          animate: { 
            rotateY: [0, 360],
            scale: [1, 1.05, 1]
          },
          transition: { duration: 4, repeat: Infinity, ease: "linear" }
        };
      
      case 'float':
        return {
          initial: { y: 0 },
          animate: { y: [-5, 5, -5] },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        };
      
      case 'bounce':
        return {
          initial: { y: 0 },
          animate: { y: [0, -10, 0] },
          transition: { duration: 1, repeat: Infinity, ease: "easeOut" }
        };
      
      case 'glow':
        return {
          initial: { opacity: 0.8, filter: 'drop-shadow(0 0 0px rgba(193, 26, 41, 0.5))' },
          animate: { 
            opacity: [0.8, 1, 0.8],
            filter: ['drop-shadow(0 0 0px rgba(193, 26, 41, 0.5))', 'drop-shadow(0 0 20px rgba(193, 26, 41, 0.8))', 'drop-shadow(0 0 0px rgba(193, 26, 41, 0.5))']
          },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      
      case 'sparkle':
        return {
          initial: { rotate: 0, scale: 1 },
          animate: { 
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      
      default:
        return {
          initial: { scale: 1 },
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  const animation = getAnimation();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animation}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      transition={{ delay }}
    >
      <Icon 
        size={size} 
        className={`${isHovered && type === 'glow' ? 'text-soul-red' : ''} transition-colors duration-300`}
        style={{ color }}
      />
      
      {/* Add glow effect overlay */}
      {type === 'glow' && (
        <div 
          className="absolute inset-0 rounded-full opacity-50 blur-lg"
          style={{ 
            backgroundColor: color === 'currentColor' ? '#C11A29' : color,
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}
        />
      )}
    </motion.div>
  );
}

// Pre-configured animated icon components
export function AnimatedShield(props: Omit<AnimatedIconProps, 'icon' | 'type'>) {
  return <AnimatedIcon {...props} icon={Shield} type="shield" />;
}

export function AnimatedLock(props: Omit<AnimatedIconProps, 'icon' | 'type'>) {
  return <AnimatedIcon {...props} icon={Lock} type="lock" />;
}

export function AnimatedHeartbeat(props: Omit<AnimatedIconProps, 'icon' | 'type'>) {
  return <AnimatedIcon {...props} icon={Heart} type="heartbeat" />;
}

export function AnimatedVaultIcon(props: Omit<AnimatedIconProps, 'icon' | 'type'>) {
  return <AnimatedIcon {...props} icon={Vault} type="vault" />;
}

export function AnimatedZap(props: Omit<AnimatedIconProps, 'icon' | 'type'>) {
  return <AnimatedIcon {...props} icon={Zap} type="sparkle" />;
}


