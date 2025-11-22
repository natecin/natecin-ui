'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface Stat {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
}

export function TrustStats() {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [counts, setCounts] = useState([0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);

  const stats: Stat[] = [
    { value: '$12M+', numericValue: 12, suffix: 'M+', label: 'Assets Secured' },
    { value: '2,400+', numericValue: 2400, suffix: '+', label: 'Active Vaults' },
    { value: '100%', numericValue: 100, suffix: '%', label: 'Trustless Execution' },
  ];

  useEffect(() => {
    if (!inView || hasAnimated) return;

    setHasAnimated(true);
    const durations = [2000, 2000, 1500];
    const intervals = stats.map((stat, index) => {
      const increment = stat.numericValue / (durations[index] / 16);
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= stat.numericValue) {
          current = stat.numericValue;
          clearInterval(intervals[index]);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = Math.floor(current);
          return newCounts;
        });
      }, 16);
    });

    return () => intervals.forEach(clearInterval);
  }, [inView, hasAnimated]);

  return (
    <section ref={ref} className="px-6 py-24 scan-lines relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-soul-red/10 rounded-full blur-3xl animate-pulse-glow opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-glow opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              {/* Glitch effect container */}
              <div className="relative mb-4 inline-block w-full">
                {/* RGB split layers for chromatic aberration */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 animate-pulse transition-opacity">
                  <div className="text-5xl md:text-6xl font-heading text-soul-red blur-sm">
                    {index === 0 && '$'}
                    {index === 1 && counts[index].toLocaleString()}
                    {index === 2 && counts[index]}
                    {stat.suffix}
                  </div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 animate-pulse transition-opacity" style={{ animationDelay: '100ms' }}>
                  <div className="text-5xl md:text-6xl font-heading text-neon-purple blur-sm" style={{ transform: 'translateX(2px)' }}>
                    {index === 0 && '$'}
                    {index === 1 && counts[index].toLocaleString()}
                    {index === 2 && counts[index]}
                    {stat.suffix}
                  </div>
                </div>

                {/* Main holographic text */}
                <div className="relative z-10">
                  <div 
                    className="text-5xl md:text-6xl font-heading holographic text-transparent bg-clip-text"
                    data-text={`${index === 0 ? '$' : ''}${counts[index]}${stat.suffix}`}
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #C11A29, #00F0FF, #B026FF, #C11A29)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {index === 0 && '$'}
                    {index === 1 && counts[index].toLocaleString()}
                    {index === 2 && counts[index]}
                    {stat.suffix}
                  </div>
                </div>
              </div>

              {/* Scan line overlay */}
              <div className="relative mb-3">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-soul-red/5 to-transparent animate-scan-lines opacity-20" />
                </div>
              </div>

              <div className="text-lg text-silver-dust font-body group-hover:text-ghost-white transition-colors">
                {stat.label}
              </div>

              {/* Bottom accent line */}
              <div className="mt-4 h-1 bg-linear-to-r from-transparent via-soul-red to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}