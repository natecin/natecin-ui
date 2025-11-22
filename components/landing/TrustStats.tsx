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

  const stats: Stat[] = [
    { value: '$12M+', numericValue: 12, suffix: 'M+', label: 'Assets Secured' },
    { value: '2,400+', numericValue: 2400, suffix: '+', label: 'Active Vaults' },
    { value: '100%', numericValue: 100, suffix: '%', label: 'Trustless Execution' },
  ];

  useEffect(() => {
    if (!inView) return;

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
  }, [inView]);

  return (
    <section ref={ref} className="px-6 py-24 scan-lines">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-heading holographic mb-3" data-text={stat.value}>
                {index === 0 && '$'}
                {index === 1 && counts[index].toLocaleString()}
                {index === 2 && counts[index]}
                {stat.suffix}
              </div>
              <div className="text-lg text-silver-dust font-body">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
