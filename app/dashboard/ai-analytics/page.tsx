'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAIUsageStats, useAIPlatformStats } from '@/hooks/useAI';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Users,
  Loader2,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const COLORS = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];

export default function AIAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState(30);
  const [showPlatformStats, setShowPlatformStats] = useState(false);

  const { 
    data: userStats, 
    isLoading: userStatsLoading, 
    error: userStatsError 
  } = useAIUsageStats(days);

  const { 
    data: platformStats, 
    isLoading: platformStatsLoading, 
    error: platformStatsError 
  } = useAIPlatformStats(days);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || userStatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const isAdmin = user?.is_staff || false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            AI Analytics
          </h1>
          <p className="text-slate-400">Track your AI usage and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent text-slate-300 border-none outline-none cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Platform Stats Toggle (Admin only) */}
          {isAdmin && (
            <button
              onClick={() => setShowPlatformStats(!showPlatformStats)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showPlatformStats
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              {showPlatformStats ? 'User Stats' : 'Platform Stats'}
            </button>
          )}
        </div>
      </div>

      {/* Error States */}
      {userStatsError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-400 font-medium">Failed to load user statistics</p>
            <p className="text-red-500/70 text-sm">{userStatsError.message}</p>
          </div>
        </div>
      )}

      {showPlatformStats && platformStatsError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-400 font-medium">Failed to load platform statistics</p>
            <p className="text-red-500/70 text-sm">
              {platformStatsError.message || 'Admin access required'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!showPlatformStats && userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Total Requests"
            value={userStats.total_requests}
            color="amber"
          />
          <StatCard
            icon={CheckCircle}
            label="Success Rate"
            value={`${userStats.success_rate.toFixed(1)}%`}
            color="green"
          />
          <StatCard
            icon={Database}
            label="Cache Hit Rate"
            value={`${userStats.cache_hit_rate.toFixed(1)}%`}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label="Avg Response Time"
            value={`${userStats.avg_response_time.toFixed(0)}ms`}
            color="purple"
          />
        </div>
      )}

      {showPlatformStats && platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Total Requests"
            value={platformStats.total_requests}
            color="amber"
          />
          <StatCard
            icon={Users}
            label="Unique Users"
            value={platformStats.unique_users}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Success Rate"
            value={`${platformStats.success_rate.toFixed(1)}%`}
            color="green"
          />
          <StatCard
            icon={Database}
            label="Cache Hit Rate"
            value={`${platformStats.cache_hit_rate.toFixed(1)}%`}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      {!showPlatformStats && userStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations Chart */}
          {userStats.by_operation && userStats.by_operation.length > 0 && (
            <ChartCard title="Requests by Operation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats.by_operation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="operation_type" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Content Type Chart */}
          {userStats.by_content_type && userStats.by_content_type.length > 0 && (
            <ChartCard title="Accepted Suggestions by Type">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStats.by_content_type}
                    dataKey="count"
                    nameKey="content_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.content_type}: ${entry.count}`}
                  >
                    {userStats.by_content_type.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {showPlatformStats && platformStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations Chart */}
          {platformStats.by_operation && platformStats.by_operation.length > 0 && (
            <ChartCard title="Requests by Operation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformStats.by_operation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="operation_type" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Model Usage Chart */}
          {platformStats.by_model && platformStats.by_model.length > 0 && (
            <ChartCard title="Requests by AI Model">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformStats.by_model}
                    dataKey="count"
                    nameKey="model_used"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.model_used}: ${entry.count}`}
                  >
                    {platformStats.by_model.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {/* Additional Metrics */}
      {!showPlatformStats && userStats && (
        <div className="bg-slate-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Additional Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricItem label="Total Tokens Used" value={userStats.total_tokens.toLocaleString()} />
            <MetricItem label="Accepted Suggestions" value={userStats.accepted_suggestions} />
            <MetricItem label="Avg Response Time" value={`${userStats.avg_response_time.toFixed(0)}ms`} />
          </div>
        </div>
      )}

      {showPlatformStats && platformStats && (
        <div className="bg-slate-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Platform Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricItem label="Total Tokens Used" value={platformStats.total_tokens.toLocaleString()} />
            <MetricItem label="Rate Limited Requests" value={platformStats.rate_limited_requests} />
            <MetricItem label="Acceptance Rate" value={`${platformStats.acceptance_rate.toFixed(1)}%`} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color: string;
}) {
  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`bg-slate-900/50 rounded-lg p-4 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-semibold">{value}</span>
    </div>
  );
}

