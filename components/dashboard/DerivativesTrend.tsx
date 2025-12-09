'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GitBranch, TrendingUp } from 'lucide-react';

interface DerivativesTrendProps {
  data: { date: string; count: number }[];
  totalDerivatives: number;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-blue-400 font-bold">
          {payload[0].value} derivative{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
}

export default function DerivativesTrend({ data, totalDerivatives }: DerivativesTrendProps) {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Calculate growth
  const firstValue = data[0]?.count || 0;
  const lastValue = data[data.length - 1]?.count || 0;
  const growth = lastValue - firstValue;

  // Check if we have meaningful data
  const hasData = data.length > 0 && data.some(d => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Derivative Growth</h3>
        {growth > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{growth} this month
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalDerivatives}</p>
            <p className="text-xs text-slate-400">Total Derivatives</p>
          </div>
        </div>
      </div>

      {/* Chart or Empty State */}
      <div className="h-36">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="derivativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-800/30 rounded-lg">
            <div className="text-center">
              <GitBranch className="w-8 h-8 mx-auto mb-2 text-blue-500/50" />
              <p className="text-sm text-slate-500">No derivative data yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Derivatives will appear as your assets get remixed
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
