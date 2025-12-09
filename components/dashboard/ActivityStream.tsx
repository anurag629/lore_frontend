'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  GitBranch,
  Gavel,
  CheckCircle,
  Shield,
  ShieldOff,
  Plus,
  Loader2,
  Activity,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardActivity, ACTIVITY_CONFIG, type ActivityType } from '@/hooks/useDashboardActivity';

// Icon mapping
const IconMap: Record<string, React.ElementType> = {
  Coins,
  GitBranch,
  Gavel,
  CheckCircle,
  Shield,
  ShieldOff,
  Plus,
};

interface ActivityItemProps {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  relativeTime: string;
  metadata?: {
    assetId?: string;
    assetTitle?: string;
    amount?: string;
    address?: string;
  };
  index: number;
}

function ActivityItem({ id, type, title, description, relativeTime, metadata, index }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[type];
  const Icon = IconMap[config.icon] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">{title}</p>
          <span className="text-xs text-slate-500 whitespace-nowrap">{relativeTime}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{description}</p>

        {/* Metadata badges */}
        {metadata?.amount && (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
            <Coins className="w-3 h-3" />
            {metadata.amount}
          </span>
        )}
      </div>

      {/* Link to asset if available */}
      {metadata?.assetId && (
        <Link
          href={`/explore/${metadata.assetId}`}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-700 rounded-lg transition-all"
          title="View asset"
        >
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </Link>
      )}
    </motion.div>
  );
}

export default function ActivityStream() {
  const { activities, loading, isEmpty } = useDashboardActivity(8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          {!loading && activities.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              {activities.length}
            </span>
          )}
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-slate-500">Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : isEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">No recent activity</p>
            <p className="text-slate-500 text-xs mt-1">
              Activity will appear here as you use the platform
            </p>
          </div>
        ) : (
          // Activity list
          <AnimatePresence>
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                {...activity}
                index={index}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* View all link */}
      {!isEmpty && !loading && (
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <button className="w-full text-center text-sm text-slate-400 hover:text-amber-400 transition-colors">
            View all activity
          </button>
        </div>
      )}
    </motion.div>
  );
}
