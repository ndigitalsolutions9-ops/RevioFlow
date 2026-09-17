import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AnalyticsEvent, ReviewSession, PrivateFeedback, Business } from '@/lib/types';

export interface DashboardStats {
  totalScans: number;
  reviewStarted: number;
  reviewsGenerated: number;
  googleOpened: number;
  privateFeedbackCount: number;
  avgRating: number;
  ratingDistribution: number[];
  topTopics: { label: string; count: number }[];
  recentFeedback: (PrivateFeedback & { rating: number | null })[];
  sessions: ReviewSession[];
  events: AnalyticsEvent[];
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(business: Business | null): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    reviewStarted: 0,
    reviewsGenerated: 0,
    googleOpened: 0,
    privateFeedbackCount: 0,
    avgRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
    topTopics: [],
    recentFeedback: [],
    sessions: [],
    events: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!business) return;
    let cancelled = false;

    async function load() {
      if (!business) return;
      try {
        const [eventsRes, feedbackRes, sessionsRes] = await Promise.all([
          supabase.from('analytics_events').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(500),
          supabase.from('private_feedback').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('review_sessions').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(200),
        ]);

        if (cancelled) return;

        const events = (eventsRes.data as AnalyticsEvent[]) ?? [];
        const feedback = (feedbackRes.data as PrivateFeedback[]) ?? [];
        const sessions = (sessionsRes.data as ReviewSession[]) ?? [];

        const totalScans = events.filter((e) => e.event_type === 'qr_page_view').length;
        const reviewStarted = events.filter((e) => e.event_type === 'review_started').length;
        const reviewsGenerated = events.filter((e) => e.event_type === 'review_generated' || e.event_type === 'review_regenerated').length;
        const googleOpened = events.filter((e) => e.event_type === 'google_review_opened').length;

        const ratedSessions = sessions.filter((s) => s.rating !== null);
        const avgRating = ratedSessions.length > 0
          ? ratedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) / ratedSessions.length
          : 0;

        const ratingDistribution = [1, 2, 3, 4, 5].map((star) =>
          ratedSessions.filter((s) => s.rating === star).length
        );

        // Top topics from session topics
        const topicCounts: Record<string, number> = {};
        for (const session of sessions) {
          const { data: sessionTopics } = await supabase
            .from('review_session_topics')
            .select('topic_id')
            .eq('review_session_id', session.id);
          if (sessionTopics) {
            for (const st of sessionTopics) {
              topicCounts[st.topic_id] = (topicCounts[st.topic_id] ?? 0) + 1;
            }
          }
        }

        // Resolve topic labels
        const topicEntries = Object.entries(topicCounts);
        const topicIds = topicEntries.map(([id]) => id);
        let topTopics: { label: string; count: number }[] = [];
        if (topicIds.length > 0) {
          const { data: topicData } = await supabase
            .from('review_topics')
            .select('id, label')
            .in('id', topicIds);
          const topicMap = new Map((topicData ?? []).map((t) => [t.id, t.label]));
          topTopics = topicEntries
            .map(([id, count]) => ({ label: topicMap.get(id) ?? 'Unknown', count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        }

        if (!cancelled) {
          setStats({
            totalScans,
            reviewStarted,
            reviewsGenerated,
            googleOpened,
            privateFeedbackCount: feedback.length,
            avgRating,
            ratingDistribution,
            topTopics,
            recentFeedback: feedback,
            sessions,
            events,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setStats((prev) => ({ ...prev, loading: false, error: 'Could not load dashboard data.' }));
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [business]);

  return stats;
}
