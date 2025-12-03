'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  BarChart, 
  ShieldCheck, 
  Wand2, 
  FileText, 
  Scale,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  Zap,
  ChevronRight,
  Loader2,
  Star,
  Quote,
  HelpCircle,
  ChevronDown,
  GitBranch,
  Globe,
  Lock,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useAssets } from '@/hooks/useAssets';
import MintModal from '@/components/mint/MintModal';

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
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  // Fetch featured assets (top 6 by derivatives or recent)
  const { assets: featuredAssets, loading: assetsLoading } = useAssets({ page: 1 });

  // Format wallet address
  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Recent activity mock data (replace with real API call)
  const recentActivity = featuredAssets?.slice(0, 4).map(asset => ({
    type: asset.is_derivative ? 'remix' : 'mint',
    asset: asset.title,
    creator: asset.creator?.display_name || formatAddress(asset.creator?.wallet_address || ''),
    time: formatDate(asset.created_at),
    icon: asset.is_derivative ? GitBranch : Sparkles
  })) || [];

  const faqs = [
    {
      question: "How does royalty tracking work?",
      answer: "Lore uses Story Protocol's smart contracts to automatically track every derivative created from your IP. When someone creates a remix, royalties are calculated and stored on-chain. You can claim your earnings anytime with a single click."
    },
    {
      question: "What is Story Protocol?",
      answer: "Story Protocol is a blockchain infrastructure specifically designed for IP management. It enables programmable IP licensing, automatic royalty distribution, and transparent tracking of derivative works. Lore is built on top of Story Protocol to make it accessible to all creators."
    },
    {
      question: "How much does it cost to use Lore?",
      answer: "Lore is free to start! You only pay blockchain gas fees (typically $0.50-$2) when minting assets. Our AI features are completely free using OpenRouter's free tier. No subscription fees, no hidden costs."
    },
    {
      question: "Can I remix any asset on the platform?",
      answer: "You can only remix assets that have 'Allow Derivatives' enabled. The original creator sets this permission when minting. If derivatives are allowed, you can create remixes and the original creator will automatically receive royalties."
    },
    {
      question: "How do I claim my royalties?",
      answer: "Simply go to your dashboard, find the asset with accumulated royalties, and click 'Claim Royalties'. The funds will be sent directly to your wallet address. All transactions are transparent and verifiable on the blockchain."
    },
    {
      question: "What types of content can I register?",
      answer: "You can register any digital creative work: digital art, music, writing, videos, 3D models, game assets, photography, and more. As long as it's your original creation, you can protect it on Lore."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      content: "Lore saved me hours of work. The AI features generate perfect titles and descriptions in seconds. Plus, I'm finally earning from my remixes!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Music Producer",
      content: "The automatic royalty tracking is a game-changer. I can see every remix of my beats and get paid automatically. No more chasing down payments!",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Alex Kim",
      role: "Content Creator",
      content: "As someone new to blockchain, Lore made it so easy. The UI is intuitive and the AI helps me create professional content without hiring writers.",
      rating: 5,
      avatar: "AK"
    }
  ];

  return (
    <>
      <MintModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)}
        onSuccess={() => setIsMintModalOpen(false)}
      />

      <div className="space-y-24 lg:space-y-32 pb-20">
        {/* Hero Section */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto text-center space-y-8 py-12 lg:py-20"
        >
          <motion.div 
            variants={item} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI • Built on Story Protocol</span>
          </motion.div>

          <motion.h1 
            variants={item} 
            className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight"
          >
            Create, Remix, <br />
            <span className="text-gradient">and Earn Forever.</span>
          </motion.h1>

          <motion.p 
            variants={item} 
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Register your IP on blockchain, generate content with AI, and earn royalties automatically. 
            The future of creative ownership is here.
          </motion.p>

          <motion.div 
            variants={item} 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button 
              variant="primary"
              onClick={() => setIsMintModalOpen(true)}
            >
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/explore">
              <Button variant="secondary">
                Explore Gallery
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            variants={item}
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Free AI Features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Instant Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Automatic Royalties</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Featured Assets Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">Featured Assets</h2>
              <p className="text-slate-400">Discover amazing creations from our community</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="hidden sm:flex">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {assetsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredAssets && featuredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAssets.slice(0, 6).map((asset, idx) => (
                <Link
                  key={asset.id}
                  href={`/explore/${asset.id}`}
                  className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-600/20 hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                      <img
                        src={asset.media_url}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-amber-400" />
                      </div>
                    )}
                    {asset.is_derivative && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                        Remix
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-50 mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {asset.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                      {asset.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {asset.derivative_count || 0}
                      </span>
                      <span className="font-mono">{formatAddress(asset.creator?.wallet_address || '')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No assets yet</h3>
              <p className="text-slate-500 mb-6">Be the first to mint an IP asset!</p>
              <Button variant="primary" onClick={() => setIsMintModalOpen(true)}>
                Create First Asset
              </Button>
            </div>
          )}
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-slate-400 text-lg">Get started in 5 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: 1,
                title: "Connect Wallet",
                desc: "Sign in with your Ethereum wallet using SIWE",
                icon: ShieldCheck,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: 2,
                title: "Upload & Describe",
                desc: "Upload your creation and add a brief description",
                icon: FileText,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: 3,
                title: "AI Enhancement",
                desc: "Let AI generate titles, descriptions, and license terms",
                icon: Wand2,
                color: "from-amber-500 to-orange-500"
              },
              {
                step: 4,
                title: "Mint to Blockchain",
                desc: "Register your IP asset on Story Protocol",
                icon: Sparkles,
                color: "from-emerald-500 to-teal-500"
              },
              {
                step: 5,
                title: "Earn Royalties",
                desc: "Automatically receive payments from derivatives",
                icon: TrendingUp,
                color: "from-red-500 to-pink-500"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative text-center"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform",
                  step.color
                )}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-8 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-100">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* AI Features Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>Powered by AI</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Save 95% of Your Time</h2>
            <p className="text-slate-400 text-lg">
              Our AI features help you create professional content in seconds, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AI Title Generation",
                desc: "Get 4 creative, SEO-friendly title suggestions instantly",
                icon: Wand2,
                color: "from-amber-500 to-orange-500",
                benefit: "2 hours → 30 seconds"
              },
              {
                title: "AI Description Enhancement",
                desc: "Transform brief notes into compelling 150-200 word narratives",
                icon: FileText,
                color: "from-purple-500 to-pink-500",
                benefit: "4 hours → 30 seconds"
              },
              {
                title: "AI License Suggestions",
                desc: "Get optimal royalty percentages and licensing terms",
                icon: Scale,
                color: "from-emerald-500 to-teal-500",
                benefit: "1 hour → 30 seconds"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={floating}
                animate="animate"
                custom={idx}
                className="group relative p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold mb-3">
                  {feature.benefit}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Grid (Enhanced) */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Why Choose Lore?</h2>
            <p className="text-slate-400 text-lg">Everything you need to protect and monetize your IP</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Mint & Protect",
                desc: "Register your work as IP Assets on the blockchain instantly. No lawyers, no delays.",
                icon: ShieldCheck,
                color: "from-emerald-500 to-teal-500",
                delay: 0
              },
              {
                title: "Remix & Build",
                desc: "Create derivative works while automatically handling licensing and royalty distribution.",
                icon: Layers,
                color: "from-amber-500 to-orange-500",
                delay: 1
              },
              {
                title: "Track & Earn",
                desc: "Real-time royalty tracking and automated revenue splits via smart contracts.",
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
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                  feature.color
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Loved by Creators</h2>
            <p className="text-slate-400 text-lg">See what creators are saying about Lore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-500/50 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-amber-500/50 mb-4" />
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Section (Enhanced) */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/5 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Platform Statistics</h2>
              <p className="text-slate-400">Join thousands of creators building on Lore</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              {[
                { 
                  label: "Assets Registered", 
                  value: "12.5K+",
                  icon: FileText,
                  color: "text-blue-400"
                },
                { 
                  label: "Total Volume", 
                  value: "$2.4M+",
                  icon: TrendingUp,
                  color: "text-green-400"
                },
                { 
                  label: "Active Creators", 
                  value: "8,420",
                  icon: Users,
                  color: "text-purple-400"
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="pt-8 sm:pt-0 px-4"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Recent Activity Feed */}
        {recentActivity.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">Recent Activity</h2>
                <p className="text-slate-400">See what's happening on Lore</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-amber-500/50 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 font-medium truncate">
                        {activity.creator} {activity.type === 'remix' ? 'remixed' : 'minted'} <span className="text-amber-400">{activity.asset}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Got Questions?</h2>
            <p className="text-slate-400 text-lg">We've got answers</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 transition-transform duration-300",
                      openFAQ === idx && "rotate-180 text-amber-400"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openFAQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Ecosystem Partners */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Built on Trusted Infrastructure</h2>
            <p className="text-slate-400">Powered by industry-leading protocols</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Story Protocol", icon: Globe, color: "from-blue-500 to-cyan-500" },
              { name: "Pinata IPFS", icon: Lock, color: "from-purple-500 to-pink-500" },
              { name: "OpenRouter", icon: Zap, color: "from-amber-500 to-orange-500" },
              { name: "Ethereum", icon: Award, color: "from-emerald-500 to-teal-500" }
            ].map((partner, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 text-center"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3",
                  partner.color
                )}>
                  <partner.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-300">{partner.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-red-600/10 border border-amber-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 animate-pulse" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Start Creating?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Join thousands of creators protecting their IP and earning royalties on the blockchain
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => setIsMintModalOpen(true)}
                  className="text-lg px-8 py-4"
                >
                  Mint Your First Asset
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link href="/explore">
                  <Button variant="secondary" className="text-lg px-8 py-4">
                    Browse Gallery
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  AI features included
                </span>
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
