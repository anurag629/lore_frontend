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
  Star,
  Quote,
  HelpCircle,
  ChevronDown,
  GitBranch,
  Globe,
  Lock,
  Award,
  Coins,
  Eye
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

  // Recent activity mock data (for other sections)
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

      <div className="pb-20">
        {/* Hero Section - Clean, Static, Fast Loading */}
        <section className="relative overflow-hidden min-h-[calc(100vh-100px)] lg:min-h-[90vh] xl:min-h-screen flex flex-col">
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            {/* Gradient Orbs */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-red-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-gradient-to-tl from-purple-500/20 via-pink-500/15 to-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 rounded-full blur-3xl" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 xl:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12 xl:gap-16 w-full">
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-center lg:text-left space-y-6 lg:space-y-7"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Powered by AI • Built on Story Protocol</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                >
                  <span className="block text-white">Create, Remix,</span>
                  <span className="block mt-2 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    and Earn Forever.
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  The decentralized platform where creators protect their IP, 
                  generate content with AI, and earn royalties automatically.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
                >
                  <Button
                    variant="primary"
                    onClick={() => setIsMintModalOpen(true)}
                    className="text-base sm:text-lg px-8 py-5 shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Link href="/explore" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      className="w-full text-base sm:text-lg px-8 py-5 hover:scale-[1.02] transition-all duration-300"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Explore Gallery
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2"
                >
                  {[
                    { icon: CheckCircle2, text: "Free AI Features", color: "text-green-400" },
                    { icon: ShieldCheck, text: "Blockchain Verified", color: "text-blue-400" },
                    { icon: Zap, text: "Instant Minting", color: "text-purple-400" },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <badge.icon className={`w-4 h-4 ${badge.color}`} />
                      <span className="text-sm text-slate-300 font-medium">{badge.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Content - Feature Cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex-1 lg:max-w-md xl:max-w-lg"
              >
                <div className="relative">
                  {/* Main Feature Card */}
                  <div className="relative p-5 sm:p-6 lg:p-7 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 opacity-60" />
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">AI-Powered Creation</h3>
                          <p className="text-xs sm:text-sm text-slate-400">Generate content in seconds</p>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { icon: Sparkles, title: "Smart Titles", desc: "4 AI-generated options", color: "from-amber-500 to-orange-500" },
                          { icon: FileText, title: "Rich Descriptions", desc: "150+ word narratives", color: "from-purple-500 to-pink-500" },
                          { icon: Scale, title: "License Advisor", desc: "Optimal royalty rates", color: "from-blue-500 to-cyan-500" },
                        ].map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                          >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                              <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-semibold text-white">{feature.title}</div>
                              <div className="text-xs text-slate-400">{feature.desc}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10">
                        {[
                          { label: "Assets", value: "12.5K+", icon: Layers },
                          { label: "AI Uses", value: "54K+", icon: Zap },
                          { label: "Creators", value: "8.4K+", icon: Users },
                        ].map((stat, idx) => (
                          <div key={idx} className="text-center">
                            <stat.icon className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge - Top Right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-white/10 shadow-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Story Protocol</div>
                      <div className="text-xs text-slate-400">IP Protected</div>
                    </div>
                  </motion.div>

                  {/* Floating Badge - Bottom Left */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-white/10 shadow-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Auto Royalties</div>
                      <div className="text-xs text-slate-400">Earn Forever</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pb-4 sm:pb-6 lg:pb-8 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Scroll to explore</span>
              <ChevronDown className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            </motion.div>
          </motion.div>
        </section>

        {/* Spacer for content below */}
        <div className="space-y-20 lg:space-y-28">

        {/* Featured Assets Section - Enhanced */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Featured Assets
              </h2>
              <p className="text-slate-400 text-lg">Discover amazing creations from our community</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="w-full sm:w-auto group">
                View All
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {assetsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden animate-pulse"
                >
                  <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-slate-800 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-800 rounded-lg w-full" />
                    <div className="h-4 bg-slate-800 rounded-lg w-2/3" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : featuredAssets && featuredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredAssets.slice(0, 6).map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <Link
                    href={`/explore/${asset.id}`}
                    className="group block bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden hover:border-amber-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-600/20 hover:-translate-y-2"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                      {asset.media_url && asset.media_url !== 'https://placeholder.example.com/media' ? (
                        <>
                          <img
                            src={asset.media_url}
                            alt={asset.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-red-600/20 flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-amber-400/50" />
                        </div>
                      )}
                      {asset.is_derivative && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                          Remix
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-5 bg-slate-900/80 backdrop-blur-sm">
                      <h3 className="font-bold text-lg text-slate-50 mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {asset.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {asset.description}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                        <span className="flex items-center gap-2 text-slate-400">
                          <GitBranch className="w-4 h-4 text-purple-400" />
                          <span className="font-medium">{asset.derivative_count || 0} remixes</span>
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {formatAddress(asset.creator?.wallet_address || '')}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20 px-4"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-6">
                <Sparkles className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-200 mb-3">No assets yet</h3>
              <p className="text-slate-400 mb-8 text-lg">Be the first to mint an IP asset!</p>
              <Button 
                variant="primary" 
                onClick={() => setIsMintModalOpen(true)}
                className="text-lg px-8 py-5"
              >
                Create First Asset
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">Get started in 5 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
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
                className="relative text-center group"
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300",
                  step.color
                )}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-10 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-slate-900">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-amber-400 transition-colors">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                {idx < 4 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 via-orange-500/30 to-transparent -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* AI Features Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-6 backdrop-blur-md">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>Powered by AI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Save 95% of Your Time
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Why Choose Lore?
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">Everything you need to protect and monetize your IP</p>
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Loved by Creators
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">See what creators are saying about Lore</p>
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
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-white/5 backdrop-blur-sm">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                Platform Statistics
              </h2>
              <p className="text-slate-400 text-lg">Join thousands of creators building on Lore</p>
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
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto px-4"
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Recent Activity
                </h2>
                <p className="text-slate-400 text-lg">See what's happening on Lore</p>
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6 backdrop-blur-md">
              <HelpCircle className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Got Questions?
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl">We've got answers</p>
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Built on Trusted Infrastructure
            </h2>
            <p className="text-slate-400 text-lg">Powered by industry-leading protocols</p>
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-red-600/10 border border-amber-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 animate-pulse" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                Ready to Start Creating?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
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
      </div>
    </>
  );
}
