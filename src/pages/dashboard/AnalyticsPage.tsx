import { useOutletContext } from 'react-router-dom';
import { Star, TrendingUp, BarChart3 } from 'lucide-react';
import { useDashboardStats } from '@/lib/use-dashboard-stats';
import { Card, Skeleton, EmptyState } from '@/components/ui';
import type { Business } from '@/lib/types';

export function AnalyticsPage() {
  const { business } = useOutletContext<{ business: Business | null }>();
  const stats = useDashboardStats(business);

  if (stats.loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="mt-6 grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <Card className="mt-6 p-6 text-center">
          <p className="text-sm text-red-600">{stats.error}</p>
        </Card>
      </div>
    );
  }

  // Rating distribution
  const totalRatings = stats.ratingDistribution.reduce((a, b) => a + b, 0);
  const maxRating = Math.max(...stats.ratingDistribution, 1);

  // Events over last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyEvents = last7Days.map((date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const count = stats.events.filter((e) => {
      const eventDate = new Date(e.created_at);
      return eventDate >= dayStart && eventDate <= dayEnd;
    }).length;
    return { date: date.toLocaleDateString('en', { weekday: 'short' }), count };
  });
  const maxDaily = Math.max(...dailyEvents.map((d) => d.count), 1);

  // AI Insights from real data
  const insights: string[] = [];
  if (stats.topTopics.length > 0) {
    insights.push(`Customers most frequently mention "${stats.topTopics[0].label}".`);
  }
  if (stats.topTopics.length > 1) {
    const second = stats.topTopics[1];
    const pct = totalRatings > 0 ? Math.round((second.count / totalRatings) * 100) : 0;
    insights.push(`"${second.label}" appeared in ${pct}% of recent feedback.`);
  }
  if (stats.avgRating > 0) {
    insights.push(`Your average customer rating is ${stats.avgRating.toFixed(1)} out of 5.`);
  }
  if (stats.googleOpened > 0 && stats.reviewsGenerated > 0) {
    const conversionRate = Math.round((stats.googleOpened / stats.reviewsGenerated) * 100);
    insights.push(`${conversionRate}% of generated reviews led to opening Google.`);
  }
  if (stats.privateFeedbackCount > 0) {
    insights.push(`You've received ${stats.privateFeedbackCount} private feedback message${stats.privateFeedbackCount > 1 ? 's' : ''}.`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">Understand what your customers are saying.</p>

      {/* Rating distribution */}
      <Card className="mt-6 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Star className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Experience Rating Distribution</h2>
        </div>
        {totalRatings === 0 ? (
          <EmptyState title="No ratings yet" description="Ratings will appear here once customers start reviewing." />
        ) : (
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star - 1];
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-gray-600">{star}</span>
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-6 rounded-lg bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Activity over 7 days */}
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Activity (Last 7 Days)</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {dailyEvents.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end h-24">
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                />
              </div>
              <span className="text-xs text-gray-400">{day.date}</span>
              <span className="text-xs font-medium text-gray-600">{day.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Most mentioned topics */}
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Most Mentioned Topics</h2>
        </div>
        {stats.topTopics.length === 0 ? (
          <EmptyState title="No topic data yet" />
        ) : (
          <div className="space-y-2.5">
            {stats.topTopics.map((topic) => {
              const maxCount = stats.topTopics[0]?.count ?? 1;
              return (
                <div key={topic.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 truncate">{topic.label}</span>
                  <div className="flex-1 h-5 rounded-lg bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                      style={{ width: `${(topic.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">{topic.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* AI Insights */}
      <Card className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">✨</span>
          <h2 className="text-sm font-semibold text-gray-900">AI Business Insights</h2>
        </div>
        {insights.length === 0 ? (
          <EmptyState title="No insights available yet" description="Insights appear once you have customer data." />
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl bg-white/60 px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-gray-400">
          Insights are generated from your actual collected data. No statistics are fabricated.
        </p>
      </Card>
    </div>
  );
}
