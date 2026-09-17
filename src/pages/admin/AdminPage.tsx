import { useState, useEffect } from 'react';
import { Building2, CreditCard, AlertTriangle, Sparkles, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Skeleton, Badge } from '@/components/ui';

export function AdminPage() {
  const [stats, setStats] = useState({
    businessCount: 0,
    activeSubs: 0,
    expiredSubs: 0,
    aiGenerations: 0,
    totalUsers: 0,
    loading: true,
  });

  useEffect(() => {
    async function loadAdminStats() {
      try {
        const [businessesRes, subsRes, usersRes, aiRes] = await Promise.all([
          supabase.from('businesses').select('id', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('status'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('ai_generation_log').select('id', { count: 'exact', head: true }),
        ]);

        const subs = subsRes.data ?? [];
        const active = subs.filter((s: { status: string }) => s.status === 'active' || s.status === 'trial').length;
        const expired = subs.filter((s: { status: string }) => s.status === 'expired').length;

        setStats({
          businessCount: businessesRes.count ?? 0,
          activeSubs: active,
          expiredSubs: expired,
          aiGenerations: aiRes.count ?? 0,
          totalUsers: usersRes.count ?? 0,
          loading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }
    loadAdminStats();
  }, []);

  const statCards = [
    { label: 'Total Businesses', value: stats.businessCount, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Subscriptions', value: stats.activeSubs, icon: CreditCard, color: 'text-green-600 bg-green-50' },
    { label: 'Expired Subscriptions', value: stats.expiredSubs, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'AI Generations', value: stats.aiGenerations, icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="info">Admin</Badge>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">System overview and usage statistics.</p>

      {stats.loading ? (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">System Status</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Database</span>
            <Badge variant="success">Operational</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">AI Generation</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Payment Processing</span>
            <Badge variant="warning">Pending Integration</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
