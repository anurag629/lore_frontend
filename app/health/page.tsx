'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded';
  checks: {
    database: HealthCheck;
    cache: HealthCheck;
    story_protocol: HealthCheck;
    pinata: HealthCheck;
    ai_service: HealthCheck;
  };
  timestamp: string;
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/detailed/');
      const data = await response.json();
      setHealth(data);
      if (data.status === 'degraded') {
        showToast('Some services are unhealthy', 'warning');
      }
    } catch (error) {
      showToast('Failed to fetch health status', 'error');
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    }
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy') {
      return 'text-green-400';
    }
    return 'text-red-400';
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading health status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">System Health</h1>
          <p className="text-slate-400">
            Last updated: {health ? new Date(health.timestamp).toLocaleString() : 'Never'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchHealth}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <div className={`mb-6 p-6 rounded-xl border ${
        health?.status === 'healthy' 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-yellow-500/10 border-yellow-500/20'
      }`}>
        <div className="flex items-center gap-3">
          {health?.status === 'healthy' ? (
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-yellow-400" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              Overall Status: {health?.status === 'healthy' ? 'Healthy' : 'Degraded'}
            </h2>
            <p className="text-slate-400 text-sm">
              {health?.status === 'healthy' 
                ? 'All systems operational' 
                : 'Some services are experiencing issues'}
            </p>
          </div>
        </div>
      </div>

      {/* Service Checks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-50 mb-4">Service Status</h2>
        
        {health && Object.entries(health.checks).map(([service, check]) => (
          <div
            key={service}
            className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(check.status)}
              <div>
                <h3 className="text-lg font-semibold text-slate-50 capitalize">
                  {service.replace('_', ' ')}
                </h3>
                {check.error && (
                  <p className="text-sm text-red-400 mt-1">{check.error}</p>
                )}
              </div>
            </div>
            <span className={`font-semibold capitalize ${getStatusColor(check.status)}`}>
              {check.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

