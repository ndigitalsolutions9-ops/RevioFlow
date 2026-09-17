import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Skeleton, Badge, EmptyState, Button } from '@/components/ui';
import type { Business, PrivateFeedback, PrivateFeedbackStatus } from '@/lib/types';

export function PrivateFeedbackPage() {
  const { business } = useOutletContext<{ business: Business | null }>();
  const [feedback, setFeedback] = useState<PrivateFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'seen' | 'resolved'>('all');

  useEffect(() => {
    async function loadFeedback() {
      if (!business) return;
      const { data } = await supabase
        .from('private_feedback')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });
      setFeedback((data as PrivateFeedback[]) ?? []);
      setLoading(false);
    }
    loadFeedback();
  }, [business]);

  async function updateStatus(id: string, status: PrivateFeedbackStatus) {
    await supabase.from('private_feedback').update({ status }).eq('id', id);
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  }

  const filtered = filter === 'all' ? feedback : feedback.filter((f) => f.status === filter);

  const statusVariants = { new: 'info' as const, seen: 'default' as const, resolved: 'success' as const };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Private Feedback</h1>
      <p className="mt-1 text-sm text-gray-500">Direct feedback from your customers.</p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-1.5">
        {(['all', 'new', 'seen', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {feedback.filter((fb) => fb.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      <div className="mt-4 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : filtered.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={<MessageSquare className="h-8 w-8" />}
              title="No feedback yet"
              description="Private feedback from customers will appear here."
            />
          </Card>
        ) : (
          filtered.map((fb) => (
            <Card key={fb.id} className="p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {fb.rating && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= fb.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(fb.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <Badge variant={statusVariants[fb.status]}>{fb.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{fb.message}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {fb.status === 'new' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(fb.id, 'seen')}>
                    Mark as seen
                  </Button>
                )}
                {fb.status !== 'resolved' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(fb.id, 'resolved')}>
                    Mark resolved
                  </Button>
                )}
                {fb.status === 'resolved' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(fb.id, 'new')}>
                    Reopen
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
