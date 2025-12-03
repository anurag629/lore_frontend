'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Layers, Zap, BarChart, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

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

const floating = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Hero Section */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto text-center space-y-8 py-12 lg:py-20"
      >
        <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>The Future of IP on Blockchain</span>
        </motion.div>

        <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight">
          Create, Remix, <br />
          <span className="text-gradient">and Earn Forever.</span>
        </motion.h1>

        <motion.p variants={item} className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Lore empowers creators to register intellectual property, track royalties transparently, and collaborate without friction using Story Protocol.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button variant="primary">
            Start Creating
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="secondary">
            Explore Gallery
          </Button>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 lg:mt-24"
      >
        {[
          {
            title: "Mint & Protect",
            desc: "Register your work as IP Assets on the blockchain instantly.",
            icon: ShieldCheck,
            color: "from-emerald-500 to-teal-500",
            delay: 0
          },
          {
            title: "Remix & Build",
            desc: "Create derivative works while automatically handling licensing.",
            icon: Layers,
            color: "from-amber-500 to-orange-500",
            delay: 1
          },
          {
            title: "Track & Earn",
            desc: "Real-time royalty tracking and automated revenue splits.",
            icon: BarChart,
            color: "from-red-500 to-pink-500",
            delay: 2
          }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            variants={floating}
            animate="animate"
            custom={idx}
            className="group relative p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/10"
          >
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/5 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {[
            { label: "Assets Registered", value: "12.5K+" },
            { label: "Total Volume", value: "$2.4M+" },
            { label: "Active Creators", value: "8,420" }
          ].map((stat, idx) => (
            <div key={idx} className="pt-8 sm:pt-0 px-4">
              <div className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
