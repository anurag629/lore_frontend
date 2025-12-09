'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Gavel, Shield, Users, FolderOpen, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

interface HealthCardProps {
  href: string;
  icon: React.ElementType;
  label: string;
  value: number | string;
  subValue?: string;
  color: 'red' | 'blue' | 'purple' | 'amber';
  status?: 'healthy' | 'warning' | 'alert';
  index: number;
}

const colorConfig = {
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'hover:border-red-500/50',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'hover:border-blue-500/50',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'hover:border-purple-500/50',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'hover:border-amber-500/50',
  },
};

function HealthCard({
  href,
  icon: Icon,
  label,
  value,
  subValue,
  color,
  status,
  index,
}: HealthCardProps) {
  const colors = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.05 }}
    >
      <Link
        href={href}
        className={`block bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 ${colors.border} hover:bg-slate-800/30 transition-all group`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>

          {/* Status indicator */}
          {status && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
              status === 'healthy' ? 'bg-green-500/20 text-green-400' :
              status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {status === 'healthy' ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span className="capitalize">{status}</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subValue && (
              <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>
            )}
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

interface IPHealthCardsProps {
  disputesCount?: number;
  pendingDisputes?: number;
  permissionsCount?: number;
  groupsCount?: number;
  collectionsCount?: number;
}

export default function IPHealthCards({
  disputesCount = 0,
  pendingDisputes = 0,
  permissionsCount = 0,
  groupsCount = 0,
  collectionsCount = 0,
}: IPHealthCardsProps) {
  // Determine dispute status
  const disputeStatus = pendingDisputes > 0 ? 'warning' : disputesCount > 0 ? 'healthy' : undefined;

  const cards: Omit<HealthCardProps, 'index'>[] = [
    {
      href: '/disputes',
      icon: Gavel,
      label: 'Disputes',
      value: disputesCount,
      subValue: pendingDisputes > 0 ? `${pendingDisputes} pending` : undefined,
      color: 'red',
      status: disputeStatus,
    },
    {
      href: '/explore',
      icon: Shield,
      label: 'Permissions',
      value: permissionsCount,
      subValue: 'Active grants',
      color: 'blue',
    },
    {
      href: '/groups',
      icon: Users,
      label: 'Groups',
      value: groupsCount,
      subValue: 'Royalty pools',
      color: 'purple',
    },
    {
      href: '/collections',
      icon: FolderOpen,
      label: 'Collections',
      value: collectionsCount,
      subValue: 'Organized assets',
      color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <HealthCard key={card.label} {...card} index={index} />
      ))}
    </div>
  );
}
