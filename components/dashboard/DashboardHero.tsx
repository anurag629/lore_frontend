'use client';

import { motion } from 'framer-motion';
import { TrendingUp, FileText, GitBranch, Gavel, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User } from '@/hooks/useAuth';
import type { DashboardStats } from '@/hooks/useDashboardStats';
import { getTimeGreeting, formatCompactNumber } from '@/hooks/useDashboardStats';

interface DashboardHeroProps {
  user: User;
  stats: DashboardStats;
}

// Animated counter component
function AnimatedCounter({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500; // ms
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
}

// Quick stat item component
function QuickStat({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="text-center group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white">
        {typeof value === 'number' ? formatCompactNumber(value) : value}
      </div>
      <div className="text-xs sm:text-sm text-slate-400">{label}</div>
    </div>
  );
}

export default function DashboardHero({ user, stats }: DashboardHeroProps) {
  const greeting = getTimeGreeting();

  // Format wallet address
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get display name
  const displayName = user.username || formatAddress(user.wallet_address);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative">
        {/* Main hero content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-amber-400">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-slate-900" />
            </motion.div>

            {/* Greeting text */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-sm sm:text-base"
              >
                {greeting},
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
              >
                {displayName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs sm:text-sm text-slate-500 font-mono mt-1"
              >
                {formatAddress(user.wallet_address)}
              </motion.p>
            </div>
          </div>

          {/* Right: Portfolio Value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="text-left sm:text-right"
          >
            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider mb-1">
              Portfolio Value
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                <AnimatedCounter value={stats.totalEarnings} decimals={4} />
              </span>
              <span className="text-lg sm:text-xl text-amber-400 font-semibold">ETH</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-400 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total Royalty Earnings</span>
            </div>
          </motion.div>
        </div>

        {/* Quick stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-slate-700/50"
        >
          <QuickStat
            icon={FileText}
            label="Total Assets"
            value={stats.totalAssets}
            color="amber"
          />
          <QuickStat
            icon={GitBranch}
            label="Derivatives"
            value={stats.totalDerivatives}
            color="blue"
          />
          <QuickStat
            icon={Coins}
            label="Spin-offs"
            value={stats.totalSpinoffs}
            color="green"
          />
          <QuickStat
            icon={Gavel}
            label="Live Assets"
            value={stats.liveAssets}
            color="purple"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
