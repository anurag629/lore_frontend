'use client';

import { motion } from 'framer-motion';
import { User, Settings, Share2, Copy, Wallet, Grid, List } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('collected');

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Cover Image */}
        <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-amber-900/50 via-orange-900/50 to-slate-900/50 border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-10 -mt-20 relative z-10 flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white/50" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Unnamed Creator</h1>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-sm font-mono">
                    <Wallet className="w-3 h-3" />
                    0x1234...5678
                    <Copy className="w-3 h-3 ml-1 cursor-pointer hover:text-white transition-colors" />
                  </span>
                  <span className="text-sm">• Joined Dec 2025</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" className="px-4 py-2 text-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="px-4 py-2 text-sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 py-4 border-y border-white/5">
              {[
                { label: 'Created', value: '12' },
                { label: 'Collected', value: '48' },
                { label: 'Followers', value: '1.2k' },
                { label: 'Following', value: '240' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-xl font-bold text-white">{stat.value}</span>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5">
          <div className="flex gap-8">
            {['collected', 'created', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-medium capitalize transition-colors relative",
                  activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pb-2">
            <button className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group aspect-square rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-3 flex items-center justify-center">
                    <Grid className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No assets found</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
