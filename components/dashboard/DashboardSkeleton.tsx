'use client';

import { motion } from 'framer-motion';

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/30 before:to-transparent";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`bg-slate-800/50 rounded-lg ${shimmer} ${className || ''}`} />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <SkeletonBox className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
              <div className="space-y-3">
                {/* Greeting skeleton */}
                <SkeletonBox className="h-8 w-48 sm:w-64" />
                {/* Wallet address skeleton */}
                <SkeletonBox className="h-4 w-32" />
              </div>
            </div>
            {/* Portfolio value skeleton */}
            <div className="text-right space-y-2">
              <SkeletonBox className="h-4 w-24 ml-auto" />
              <SkeletonBox className="h-10 w-40" />
            </div>
          </div>

          {/* Quick stats row skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <SkeletonBox className="h-8 w-16 mx-auto" />
                <SkeletonBox className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Large earnings chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 lg:col-span-1 bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
          >
            <SkeletonBox className="h-6 w-32 mb-4" />
            <SkeletonBox className="h-48 w-full" />
          </motion.div>

          {/* Asset status pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
          >
            <SkeletonBox className="h-6 w-28 mb-4" />
            <SkeletonBox className="h-48 w-full rounded-full mx-auto max-w-[200px]" />
          </motion.div>

          {/* Derivatives trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
          >
            <SkeletonBox className="h-6 w-36 mb-4" />
            <SkeletonBox className="h-48 w-full" />
          </motion.div>
        </div>

        {/* Activity & Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Activity Stream */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
          >
            <SkeletonBox className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-3/4" />
                    <SkeletonBox className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
          >
            <SkeletonBox className="h-6 w-28 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonBox key={i} className="h-24 w-full" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* IP Health Cards Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonBox className="w-10 h-10 rounded-lg" />
                <SkeletonBox className="w-8 h-6" />
              </div>
              <SkeletonBox className="h-4 w-20" />
            </div>
          ))}
        </motion.div>

        {/* Asset Table Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-7 w-32" />
              <div className="flex gap-2">
                <SkeletonBox className="h-10 w-24" />
                <SkeletonBox className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden lg:grid grid-cols-6 gap-4 p-4 bg-slate-800/30">
            {[...Array(6)].map((_, i) => (
              <SkeletonBox key={i} className="h-4 w-20" />
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="hidden lg:grid grid-cols-6 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <SkeletonBox className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <SkeletonBox className="h-4 w-24" />
                      <SkeletonBox className="h-3 w-16" />
                    </div>
                  </div>
                  <SkeletonBox className="h-6 w-16" />
                  <SkeletonBox className="h-4 w-20" />
                  <SkeletonBox className="h-4 w-12" />
                  <SkeletonBox className="h-4 w-24" />
                  <SkeletonBox className="h-8 w-20" />
                </div>
                {/* Mobile view */}
                <div className="lg:hidden flex items-center gap-3">
                  <SkeletonBox className="w-12 h-12 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-3/4" />
                    <SkeletonBox className="h-3 w-1/2" />
                  </div>
                  <SkeletonBox className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Genealogy Graph Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6"
        >
          <SkeletonBox className="h-7 w-40 mb-4" />
          <SkeletonBox className="h-64 w-full" />
        </motion.div>
      </div>
    </div>
  );
}
