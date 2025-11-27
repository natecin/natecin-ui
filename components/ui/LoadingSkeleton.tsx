'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  lines?: number;
}

export function LoadingSkeleton({ 
  className = '', 
  height = '20px', 
  width = '100%',
  variant = 'text',
  lines = 1
}: LoadingSkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="bg-charcoal/50 rounded animate-pulse"
            style={{
              height: '16px',
              width: index === lines - 1 ? '60%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        ${variant === 'circular' ? 'rounded-full' : 'rounded'}
        ${variant === 'text' ? 'bg-charcoal/50 animate-pulse' : 'bg-gradient-to-r from-charcoal/50 to-charcoal/30 animate-pulse'}
        ${className}
      `}
      style={{ height, width }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 border border-white/20 rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <LoadingSkeleton height="16px" width="16px" variant="circular" />
        <LoadingSkeleton height="16px" width="120px" />
      </div>
      
      <div className="space-y-3">
        <LoadingSkeleton height="40px" />
        <LoadingSkeleton lines={3} />
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="p-6 border border-white/20 rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <LoadingSkeleton height="16px" width="16px" variant="circular" />
        <LoadingSkeleton height="16px" width="120px" />
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <LoadingSkeleton height="32px" width="32px" variant="circular" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton height="16px" width="150px" />
              <LoadingSkeleton height="14px" width="100%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetPortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="p-6 border border-white/20 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LoadingSkeleton height="16px" width="16px" variant="circular" />
            <LoadingSkeleton height="16px" width="120px" />
          </div>
          <LoadingSkeleton height="32px" width="32px" variant="circular" />
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <LoadingSkeleton height="32px" width="150px" />
            <LoadingSkeleton height="14px" width="50px" />
          </div>
          <LoadingSkeleton height="16px" width="100px" />
        </div>
        
        <div className="relative h-48 mb-6">
          <LoadingSkeleton height="192px" variant="circular" className="mx-auto" />
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-charcoal/50 rounded-lg">
              <div className="flex items-center gap-3">
                <LoadingSkeleton height="12px" width="12px" variant="circular" />
                <div>
                  <LoadingSkeleton height="16px" width="80px" />
                  <LoadingSkeleton height="12px" width="60px" />
                </div>
              </div>
              <div className="text-right">
                <LoadingSkeleton height="16px" width="60px" />
                <LoadingSkeleton height="12px" width="40px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActionCenterSkeleton() {
  return (
    <div className="p-6 border border-white/20 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LoadingSkeleton height="16px" width="16px" variant="circular" />
          <LoadingSkeleton height="16px" width="120px" />
        </div>
        <div className="flex items-center gap-2">
          <LoadingSkeleton height="12px" width="12px" variant="circular" />
          <LoadingSkeleton height="12px" width="80px" />
        </div>
      </div>
      
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 bg-charcoal/50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <LoadingSkeleton height="16px" width="16px" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <LoadingSkeleton height="16px" width="120px" />
                    <LoadingSkeleton height="16px" width="60px" />
                  </div>
                  <LoadingSkeleton height="14px" width="100%" />
                  <LoadingSkeleton height="32px" width="120px" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
