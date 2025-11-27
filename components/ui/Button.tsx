'use client';

import React, { useState, useRef } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-8 py-4 text-sm',
    lg: 'px-12 py-5 text-base'
  };

  const baseStyles = `relative overflow-hidden rounded font-family-heading font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]}`;
  
  const variantStyles = {
    primary: 'bg-soul-red text-ghost-white hover:bg-soul-red/90 box-glow hover:box-glow-strong hover:scale-105',
    secondary: 'glass-enhanced text-ghost-white hover:scale-105 border border-white/20',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 5,
            top: ripple.y - 5,
            width: '10px',
            height: '10px',
            pointerEvents: 'none',
          }}
        />
      ))}
      {children}
    </button>
  );
}
