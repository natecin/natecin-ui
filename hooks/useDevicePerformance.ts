'use client';

import { useState, useEffect } from 'react';

export interface DevicePerformance {
  isLowEnd: boolean;
  isMobile: boolean;
  shouldReduceAnimations: boolean;
  preferredGlassClass: string;
}

export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>({
    isLowEnd: false,
    isMobile: false,
    shouldReduceAnimations: false,
    preferredGlassClass: 'glass-enhanced'
  });

  useEffect(() => {
    const checkDevicePerformance = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       window.innerWidth < 768;

      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.downlink < 1
      );
      
      const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const isLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      const isSlowDevice = isSlowConnection || isLowMemory || isLowCores;

      let preferredGlassClass = 'glass-enhanced';
      if (isSlowDevice && isMobile) {
        preferredGlassClass = 'glass-none';
      } else if (isMobile) {
        preferredGlassClass = 'glass-mobile';
      } else if (isSlowDevice) {
        preferredGlassClass = 'glass-light';
      }

      setPerformance({
        isLowEnd: isSlowDevice,
        isMobile,
        shouldReduceAnimations: isSlowDevice || isMobile,
        preferredGlassClass
      });
    };

    checkDevicePerformance();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', checkDevicePerformance);
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkDevicePerformance);
      }
    };
  }, []);

  return performance;
}
