'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetStatusPieProps {
  data: { name: string; value: number; color: string }[];
  totalAssets: number;
}

// Custom tooltip
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-white font-medium">{data.name}</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          {data.value} asset{data.value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
}

// Custom label component
function CustomLabel({ cx, cy, totalAssets }: { cx: number; cy: number; totalAssets: number }) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white text-3xl font-bold"
      >
        {totalAssets}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-400 text-xs"
      >
        Total
      </text>
    </g>
  );
}

export default function AssetStatusPie({ data, totalAssets }: AssetStatusPieProps) {
  // If no data, show empty state
  const hasData = data.length > 0 && data.some(d => d.value > 0);

  // Default data for empty state
  const displayData = hasData
    ? data
    : [{ name: 'No Assets', value: 1, color: '#475569' }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Asset Status</h3>

      {/* Chart */}
      <div className="h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={hasData ? 3 : 0}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Center label */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize="28"
              fontWeight="bold"
            >
              {totalAssets}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize="12"
            >
              Total
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-400">
              {item.name}
              <span className="text-slate-500 ml-1">({item.value})</span>
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
