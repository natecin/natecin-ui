'use client';

import React, { useRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseStyles = 'relative overflow-hidden px-8 py-4 rounded font-family-heading font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-soul-red text-ghost-white hover:bg-soul-red/90 box-glow hover:box-glow-strong hover:scale-105',
    secondary: 'glass-enhanced text-ghost-white hover:scale-105 border border-white/20',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '10px';
    ripple.style.height = '10px';

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
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
      {children}
    </button>
  );
}
