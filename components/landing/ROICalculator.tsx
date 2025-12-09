'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { TrendingUp, DollarSign, Repeat } from 'lucide-react';

interface ROICalculatorProps {
  onCTAClick?: () => void;
}

export default function ROICalculator({ onCTAClick }: ROICalculatorProps) {
  const [assets, setAssets] = useState(5);
  const [avgPrice, setAvgPrice] = useState(50);
  const [remixRate, setRemixRate] = useState(20);
  
  const [displayEarnings, setDisplayEarnings] = useState(0);

  // Calculate earnings
  const directSales = assets * avgPrice;
  const royaltiesFromRemixes = assets * (remixRate / 100) * avgPrice * 0.1; // 10% royalty
  const totalEarnings = directSales + royaltiesFromRemixes;

  // Animate counter
  useEffect(() => {
    let start = displayEarnings;
    const end = totalEarnings;
    const duration = 1000;
    const steps = 60;
    const increment = (end - start) / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current++;
      if (current === steps) {
        setDisplayEarnings(end);
        clearInterval(timer);
      } else {
        setDisplayEarnings(start + increment * current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalEarnings]);

  return (
    <GlassCard enhanced hover className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
          Earnings Calculator
        </h3>
        <p className="text-slate-400">
          See your potential earnings on Lore
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Number of Assets */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">Number of Assets</label>
            <span className="text-amber-400 font-bold">{assets}</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={assets}
            onChange={(e) => setAssets(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Average Price */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">Average Price (USD)</label>
            <span className="text-amber-400 font-bold">${avgPrice}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={avgPrice}
            onChange={(e) => setAvgPrice(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Remix Rate */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-slate-300 font-medium">Expected Remixes (%)</label>
            <span className="text-amber-400 font-bold">{remixRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={remixRate}
            onChange={(e) => setRemixRate(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-red-600/10 border border-amber-500/20 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm mb-2">Projected Monthly Earnings</p>
          <motion.p
            key={displayEarnings}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400"
          >
            ${Math.round(displayEarnings).toLocaleString()}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Direct Sales</span>
            </div>
            <p className="text-lg font-bold text-white">
              ${directSales.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
              <Repeat className="w-4 h-4" />
              <span className="text-xs font-medium">Royalties</span>
            </div>
            <p className="text-lg font-bold text-white">
              ${Math.round(royaltiesFromRemixes).toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-purple-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Remixes</span>
            </div>
            <p className="text-lg font-bold text-white">
              {Math.round(assets * (remixRate / 100))}
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="glow"
        className="w-full"
        onClick={onCTAClick}
      >
        Start Earning Now
      </Button>
    </GlassCard>
  );
}
