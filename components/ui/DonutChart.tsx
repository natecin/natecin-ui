'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface HeirData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface DonutChartProps {
  data?: HeirData[];
}

const defaultData: HeirData[] = [
  { name: 'Heir A', value: 60, color: '#C11A29' },
  { name: 'Heir B', value: 40, color: '#FF2E3B' },
];

export function DonutChart({ data = defaultData }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry: any) => (
            <span className="text-silver-dust text-sm">
              {value}: {entry.payload.value}%
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
