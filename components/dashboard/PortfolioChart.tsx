'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioChartProps {
  totalEarnings: number;
}

// Generate mock earnings data based on total earnings
function generateEarningsData(totalEarnings: number, days: number) {
  const data = [];
  const now = new Date();

  // Create a growth curve that ends at totalEarnings
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate growth with some randomness
    const progress = (days - i) / days;
    const baseValue = totalEarnings * progress * 0.8;
    const randomFactor = 1 + (Math.random() - 0.5) * 0.3;
    const value = Math.max(0, baseValue * randomFactor);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      earnings: Number(value.toFixed(6)),
    });
  }

  // Ensure the last value matches total earnings
  if (data.length > 0) {
    data[data.length - 1].earnings = totalEarnings;
  }

  return data;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-amber-400 font-bold">
          {payload[0].value.toFixed(4)} ETH
        </p>
      </div>
    );
  }
  return null;
}

export default function PortfolioChart({ totalEarnings }: PortfolioChartProps) {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  const data = generateEarningsData(totalEarnings, timeRange);

  // Calculate trend
  const firstValue = data[0]?.earnings || 0;
  const lastValue = data[data.length - 1]?.earnings || 0;
  const trendPercent = firstValue > 0
    ? ((lastValue - firstValue) / firstValue * 100).toFixed(1)
    : '0';
  const isPositive = lastValue >= firstValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Earnings Trend</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">
              {totalEarnings.toFixed(4)} ETH
            </span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? '+' : ''}{trendPercent}%
            </span>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === days
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(2)}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#earningsGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
