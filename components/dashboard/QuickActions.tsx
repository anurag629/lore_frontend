'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Coins, Gavel, Zap, ChevronRight } from 'lucide-react';

interface QuickActionProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string | number;
  variant?: 'primary' | 'default';
  color?: string;
  index: number;
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  variant = 'default',
  color = 'slate',
  index,
}: QuickActionProps) {
  const isPrimary = variant === 'primary';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <Link
        href={href}
        className={`group relative block overflow-hidden p-4 rounded-xl transition-all duration-300 ${
          isPrimary
            ? 'bg-gradient-to-br from-amber-600 to-orange-700 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]'
            : `bg-slate-800/50 border border-slate-700 hover:border-${color}-500/50 hover:bg-slate-800`
        }`}
      >
        {/* Hover gradient overlay for primary */}
        {isPrimary && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Badge */}
        {badge !== undefined && (
          <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full ${
            isPrimary
              ? 'bg-white/20 text-white'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            {badge}
          </span>
        )}

        {/* Icon */}
        <Icon className={`w-8 h-8 mb-3 ${
          isPrimary ? 'text-white' : `text-${color}-400`
        }`} />

        {/* Text */}
        <p className={`font-semibold ${isPrimary ? 'text-white' : 'text-white'}`}>
          {title}
        </p>
        <p className={`text-xs mt-0.5 ${
          isPrimary ? 'text-white/70' : 'text-slate-400'
        }`}>
          {description}
        </p>

        {/* Arrow indicator */}
        <ChevronRight className={`absolute bottom-4 right-4 w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all ${
          isPrimary ? 'text-white/70' : 'text-slate-500'
        }`} />
      </Link>
    </motion.div>
  );
}

interface QuickActionsProps {
  pendingRoyalties?: number;
  pendingDisputes?: number;
}

export default function QuickActions({ pendingRoyalties, pendingDisputes }: QuickActionsProps) {
  const actions: Omit<QuickActionProps, 'index'>[] = [
    {
      href: '/',
      icon: Plus,
      title: 'Mint Asset',
      description: 'Create new IP',
      variant: 'primary',
    },
    {
      href: '/royalties',
      icon: Coins,
      title: 'Royalties',
      description: 'Claim earnings',
      color: 'green',
      badge: pendingRoyalties && pendingRoyalties > 0 ? `${pendingRoyalties} pending` : undefined,
    },
    {
      href: '/disputes',
      icon: Gavel,
      title: 'Disputes',
      description: 'Review challenges',
      color: 'red',
      badge: pendingDisputes && pendingDisputes > 0 ? pendingDisputes : undefined,
    },
    {
      href: '/dashboard/ai-analytics',
      icon: Zap,
      title: 'AI Analytics',
      description: 'Usage stats',
      color: 'purple',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard key={action.title} {...action} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
