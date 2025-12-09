'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Sparkles, ArrowRight, FileText, GitBranch } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';

interface TrendingSidebarProps {
  totalAssets: number;
}

export default function TrendingSidebar({ totalAssets }: TrendingSidebarProps) {
  // Fetch assets to compute top creators
  const { assets } = useAssets();

  // Format address
  function formatAddress(address: string): string {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Get unique top creators sorted by asset count
  const topCreators = assets
    .filter((a, i, arr) => arr.findIndex(b => b.creator?.wallet_address === a.creator?.wallet_address) === i)
    .map(a => ({
      address: a.creator?.wallet_address || '',
      name: a.creator?.display_name || formatAddress(a.creator?.wallet_address || ''),
      avatar: a.creator?.avatar_url,
      assetCount: assets.filter(b => b.creator?.wallet_address === a.creator?.wallet_address).length,
    }))
    .sort((a, b) => b.assetCount - a.assetCount)
    .slice(0, 5);

  // Count derivatives from actual data
  const totalDerivatives = assets.reduce((acc, a) => acc + (a.derivative_count || 0), 0);

  // Count unique creators
  const uniqueCreators = new Set(assets.map(a => a.creator?.wallet_address)).size;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 space-y-4"
    >
      {/* Platform Stats */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Platform Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{totalAssets}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" />
              IPs
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{totalDerivatives}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <GitBranch className="w-3 h-3" />
              Remixes
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800/50 text-center">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">{uniqueCreators} Creators</span>
          </div>
        </div>
      </div>

      {/* Top Creators */}
      {topCreators.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-amber-500" />
            Top Creators
          </h3>
          <div className="space-y-2">
            {topCreators.map((creator, index) => (
              <Link
                key={creator.address}
                href={`/profile/${creator.address}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-800/50 transition-colors group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                      {creator.avatar ? (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-400">
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-amber-400 border border-slate-700">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-amber-400 transition-colors">
                    {creator.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {creator.assetCount} {creator.assetCount === 1 ? 'IP' : 'IPs'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mint CTA */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-4 text-center">
        <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <h3 className="text-white font-semibold text-sm mb-1">Create Your IP</h3>
        <p className="text-slate-400 text-xs mb-3">
          Register your work on-chain
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.aside>
  );
}
