'use client';

import Marquee from 'react-fast-marquee';
import { Shield, CheckCircle, Lock, Globe, Zap, Award } from 'lucide-react';

const trustBadges = [
  { icon: Shield, text: 'Blockchain Verified', color: 'text-blue-400' },
  { icon: CheckCircle, text: 'Smart Contract Audited', color: 'text-green-400' },
  { icon: Lock, text: 'IPFS Permanent Storage', color: 'text-purple-400' },
  { icon: Globe, text: 'Decentralized Network', color: 'text-cyan-400' },
  { icon: Zap, text: 'Lightning Fast', color: 'text-yellow-400' },
  { icon: Award, text: 'Industry Leading', color: 'text-amber-400' },
];

const partners = [
  'Story Protocol',
  'IPFS',
  'Ethereum',
  'OpenAI',
  'Pinata',
  'WalletConnect',
];

interface TrustMarqueeProps {
  speed?: number;
  variant?: 'badges' | 'partners';
}

export function TrustMarquee({ speed = 50, variant = 'badges' }: TrustMarqueeProps) {
  if (variant === 'partners') {
    return (
      <div className="w-full py-8 overflow-hidden">
        <Marquee speed={speed} gradient={false} className="py-4">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="mx-8 px-6 py-3 rounded-lg glass transition-all duration-300 hover:glass-enhanced-hover grayscale hover:grayscale-0"
            >
              <span className="text-slate-400 hover:text-white font-semibold text-lg transition-colors">
                {partner}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    );
  }

  return (
    <div className="w-full py-8 overflow-hidden">
      <Marquee speed={speed} gradient={false} className="py-4">
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className="mx-6 flex items-center gap-3 px-6 py-3 rounded-lg glass transition-all duration-300 hover:glass-enhanced-hover"
            >
              <Icon className={`w-5 h-5 ${badge.color}`} />
              <span className="text-slate-300 hover:text-white font-medium transition-colors">
                {badge.text}
              </span>
            </div>
          );
        })}
      </Marquee>
    </div>
  );
}
