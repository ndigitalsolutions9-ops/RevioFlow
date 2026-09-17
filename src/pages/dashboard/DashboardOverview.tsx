import { useOutletContext } from 'react-router-dom';
import { Star, MousePointerClick, Sparkles, ExternalLink, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { useDashboardStats } from '@/lib/use-dashboard-stats';
import { Card, Skeleton, Badge } from '@/components/ui';
import type { Business } from '@/lib/types';

export function DashboardOverview() {
  const { business } = useOutletContext<{ business: Business | null }>();
  const stats = useDashboardStats(business);

  if (stats.loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <Card className="mt-6 p-6 text-center">
          <p className="text-sm text-red-600">{stats.error}</p>
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: 'QR Scans', value: stats.totalScans, icon: Star, color: 'text-blue-600 bg-blue-50' },
    { label: 'Review Flows Started', value: stats.reviewStarted, icon: MousePointerClick, color: 'text-purple-600 bg-purple-50' },
    { label: 'AI Reviews Generated', value: stats.reviewsGenerated, icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
    { label: 'Google Opened', value: stats.googleOpened, icon: ExternalLink, color: 'text-green-600 bg-green-50' },
    { label: 'Private Feedback', value: stats.privateFeedbackCount, icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const funnel = [
    { label: 'QR Scans', value: stats.totalScans, color: 'bg-blue-500' },
    { label: 'Review Started', value: stats.reviewStarted, color: 'bg-purple-500' },
    { label: 'Review Generated', value: stats.reviewsGenerated, color: 'bg-amber-500' },
    { label: 'Google Opened', value: stats.googleOpened, color: 'bg-green-500' },
  ];
  const maxValue = Math.max(...funnel.map((f) => f.value), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">Your review collection at a glance.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Conversion funnel */}
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Filter className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Conversion Funnel</h2>
        </div>
        <div className="space-y-3">
          {funnel.map((stage, i) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{stage.label}</span>
                <span className="font-medium text-gray-900">{stage.value}</span>
              </div>
              <div className="h-7 rounded-lg bg-gray-100 overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-lg transition-all duration-500`}
                  style={{ width: `${(stage.value / maxValue) * 100}%` }}
                />
              </div>
              {i < funnel.length - 1 && (
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  {stage.value > 0 ? `${Math.round((funnel[i + 1].value / stage.value) * 100)}% continue` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            "Google Opened" means the customer opened the Google review page — not that they posted the review.
            We can only confirm actual posts through an official Google integration.
          </p>
        </div>
      </Card>

      {/* Recent private feedback */}
      {stats.recentFeedback.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Private Feedback</h2>
          </div>
          <div className="space-y-3">
            {stats.recentFeedback.slice(0, 5).map((fb) => (
              <div key={fb.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${s <= (fb.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 flex-1 line-clamp-2">{fb.message}</p>
                <Badge variant={fb.status === 'new' ? 'info' : fb.status === 'seen' ? 'default' : 'success'}>
                  {fb.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
