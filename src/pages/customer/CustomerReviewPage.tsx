import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ArrowRight, ArrowLeft, Check, Copy, ExternalLink, MessageSquare, Sparkles, RefreshCw, Edit3, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateReview } from '@/lib/ai-client';
import { trackEvent } from '@/lib/analytics';
import type { AIReviewStyle } from '@/lib/types';
import { Button, Textarea, LoadingSpinner } from '@/components/ui';

interface BusinessPublicInfo {
  session_id: string;
  session_token: string;
  business_id: string;
  business_name: string;
  business_slug: string;
  business_category: string;
  business_logo_url: string | null;
  business_welcome_message: string | null;
  business_google_review_url: string | null;
}

interface TopicInfo {
  id: string;
  label: string;
}

type Step = 'loading' | 'error' | 'welcome' | 'rating' | 'topics' | 'comment' | 'generating' | 'review' | 'feedback' | 'done';

export function CustomerReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<Step>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [bizInfo, setBizInfo] = useState<BusinessPublicInfo | null>(null);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [editableReview, setEditableReview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clipboardFailed, setClipboardFailed] = useState(false);

  // Initialize session
  useEffect(() => {
    async function init() {
      if (!slug) return;
      try {
        const { data, error } = await supabase.rpc('create_review_session', {
          p_business_slug: slug,
        });

        if (error || !data || data.length === 0) {
          setErrorMsg('This business page is not available. Please check the QR code or link.');
          setStep('error');
          return;
        }

        const info = data[0] as BusinessPublicInfo;
        setBizInfo(info);

        // Track page view
        await trackEvent(slug, info.session_token, 'qr_page_view');

        // Load topics
        const { data: topicData } = await supabase
          .from('review_topics')
          .select('id, label')
          .eq('business_id', info.business_id)
          .eq('active', true)
          .order('display_order');

        setTopics((topicData as TopicInfo[]) ?? []);
        setStep('welcome');
      } catch {
        setErrorMsg('Something went wrong. Please try again.');
        setStep('error');
      }
    }
    init();
  }, [slug]);

  const startReview = async () => {
    if (!slug || !bizInfo) return;
    await trackEvent(slug, bizInfo.session_token, 'review_started');
    setStep('rating');
  };

  const submitRating = async (value: number) => {
    setRating(value);
    if (!slug || !bizInfo) return;
    await supabase.rpc('update_review_session', {
      p_session_token: bizInfo.session_token,
      p_rating: value,
      p_status: 'rated',
    });
    await trackEvent(slug, bizInfo.session_token, 'rating_selected', { rating: value });
    setStep('topics');
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((t) => t !== topicId) : [...prev, topicId]
    );
  };

  const proceedToComment = async () => {
    if (!slug || !bizInfo) return;
    const topicLabels = selectedTopics
      .map((id) => topics.find((t) => t.id === id)?.label)
      .filter(Boolean) as string[];
    await supabase.rpc('update_review_session', {
      p_session_token: bizInfo.session_token,
      p_status: 'topics_selected',
    });
    await supabase.rpc('set_session_topics', {
      p_session_token: bizInfo.session_token,
      p_topic_ids: selectedTopics,
    });
    await trackEvent(slug, bizInfo.session_token, 'topics_selected', { topics: topicLabels });
    setStep('comment');
  };

  const generateAIReview = useCallback(async (style: AIReviewStyle = 'standard', isRegen = false) => {
    if (!bizInfo) return;
    setAiLoading(true);
    setAiError(null);
    setStep('generating');

    const topicLabels = selectedTopics
      .map((id) => topics.find((t) => t.id === id)?.label)
      .filter(Boolean) as string[];

    try {
      const result = await generateReview(bizInfo.session_token, {
        businessName: bizInfo.business_name,
        businessCategory: bizInfo.business_category,
        rating,
        selectedTopics: topicLabels,
        customerComment: comment.trim() || null,
        requestedStyle: style,
      });

      if (result.error || !result.review) {
        setAiError(result.error || 'Could not generate a review. Please try again.');
        setStep('review');
        setAiLoading(false);
        return;
      }

      setGeneratedReview(result.review);
      setEditableReview(result.review);
      await supabase.rpc('update_review_session', {
        p_session_token: bizInfo.session_token,
        p_generated_review: result.review,
        p_status: 'review_generated',
      });
      await trackEvent(bizInfo.business_slug, bizInfo.session_token, isRegen ? 'review_regenerated' : 'review_generated', { style });
      setStep('review');
    } catch {
      setAiError('Something went wrong. Please try again.');
      setStep('review');
    }
    setAiLoading(false);
  }, [bizInfo, rating, selectedTopics, topics, comment]);

  const copyAndOpenGoogle = async () => {
    if (!bizInfo || !slug) return;
    const textToCopy = isEditing ? editableReview : generatedReview;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setClipboardFailed(false);
    } catch {
      setClipboardFailed(true);
      return;
    }

    await trackEvent(slug, bizInfo.session_token, 'review_copied');
    await trackEvent(slug, bizInfo.session_token, 'google_review_opened');

    if (bizInfo.business_google_review_url) {
      window.open(bizInfo.business_google_review_url, '_blank', 'noopener,noreferrer');
    }

    await supabase.rpc('update_review_session', {
      p_session_token: bizInfo.session_token,
      p_status: 'completed',
    });

    setTimeout(() => setStep('done'), 800);
  };

  const submitFeedback = async () => {
    if (!bizInfo || !slug || !feedbackMessage.trim()) return;
    try {
      await supabase.rpc('submit_private_feedback', {
        p_session_token: bizInfo.session_token,
        p_message: feedbackMessage.trim(),
        p_rating: rating,
      });
      await trackEvent(slug, bizInfo.session_token, 'private_feedback_submitted');
      setFeedbackSent(true);
    } catch {
      setAiError('Could not send feedback. Please try again.');
    }
  };

  // ===== Loading state =====
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner className="h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ===== Error state =====
  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6">
        <div className="max-w-sm text-center animate-fade-in">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Page not available</h1>
          <p className="mt-2 text-sm text-gray-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!bizInfo) return null;

  const welcomeMessage = bizInfo.business_welcome_message || `How was your experience at ${bizInfo.business_name}?`;

  // ===== Welcome step =====
  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6">
        <div className="max-w-sm w-full text-center animate-slide-up">
          {bizInfo.business_logo_url && (
            <img src={bizInfo.business_logo_url} alt={bizInfo.business_name} className="h-20 w-20 rounded-2xl object-cover mx-auto mb-5 shadow-sm border border-gray-100" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{welcomeMessage}</h1>
          <p className="mt-2 text-sm text-gray-500">Your feedback helps {bizInfo.business_name} improve.</p>
          <Button size="lg" className="mt-8 w-full" onClick={startReview}>
            Share your experience <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-4 text-xs text-gray-400">Takes less than 30 seconds</p>
        </div>
      </div>
    );
  }

  // ===== Rating step =====
  if (step === 'rating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6">
        <div className="max-w-sm w-full text-center animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-900">How was your experience?</h1>
          <p className="mt-2 text-sm text-gray-500">Tap a star to rate.</p>
          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => submitRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-12 w-12 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== Topics step =====
  if (step === 'topics') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12">
        <div className="max-w-sm w-full animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-900 text-center">What would you like to mention?</h1>
          <p className="mt-2 text-sm text-gray-500 text-center">Select all that apply.</p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {topics.map((topic) => {
              const selected = selectedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                    selected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5 inline mr-1" />}
                  {topic.label}
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep('rating')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button className="flex-1" onClick={proceedToComment} disabled={selectedTopics.length === 0}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Comment step =====
  if (step === 'comment') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12">
        <div className="max-w-sm w-full animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Anything else you'd like to mention?</h1>
          <p className="mt-2 text-sm text-gray-500 text-center">Optional — your comment helps the AI write a better review.</p>
          <div className="mt-6">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us briefly about your experience..."
              rows={4}
            />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="ghost" onClick={() => setStep('topics')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button className="flex-1" onClick={() => generateAIReview('standard')}>
              <Sparkles className="h-4 w-4" /> Write my review
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Generating step =====
  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6">
        <div className="max-w-sm w-full text-center animate-fade-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-5">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Writing your review...</h1>
          <p className="mt-2 text-sm text-gray-500">Crafting a natural review from your input.</p>
          <div className="mt-6 flex justify-center">
            <LoadingSpinner className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  // ===== Review step =====
  if (step === 'review') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12">
        <div className="max-w-md w-full animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Your review is ready</h1>
          <p className="mt-1.5 text-sm text-gray-500 text-center">Edit it if you'd like, then copy and post on Google.</p>

          {aiError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            {isEditing ? (
              <Textarea
                value={editableReview}
                onChange={(e) => setEditableReview(e.target.value)}
                rows={6}
                className="border-0 focus:ring-0 p-0"
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedReview}</p>
            )}
          </div>

          {/* Review controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateAIReview('standard', true)}
              loading={aiLoading}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateAIReview('shorter', true)} loading={aiLoading}>
              Make shorter
            </Button>
            <Button variant="outline" size="sm" onClick={() => generateAIReview('detailed', true)} loading={aiLoading}>
              More detailed
            </Button>
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setIsEditing(!isEditing);
                if (isEditing) setGeneratedReview(editableReview);
              }}
            >
              <Edit3 className="h-3.5 w-3.5" /> {isEditing ? 'Done editing' : 'Edit manually'}
            </Button>
          </div>

          {/* Copy & Open Google */}
          <div className="mt-6 space-y-3">
            <Button size="lg" className="w-full" onClick={copyAndOpenGoogle}>
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copied! Opening Google...' : 'Copy & Open Google'}
            </Button>

            {clipboardFailed && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                <p className="font-medium mb-1">Couldn't copy automatically.</p>
                <p className="text-xs">Tap and hold the text above to copy it manually, then open Google.</p>
                {bizInfo.business_google_review_url && (
                  <a
                    href={bizInfo.business_google_review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-blue-600 font-medium text-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Google Reviews
                  </a>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              Paste your review into Google, choose your rating, and tap Post.
            </p>
          </div>

          {/* Private feedback */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep('feedback')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              <MessageSquare className="h-4 w-4" /> Send private feedback to {bizInfo.business_name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Private feedback step =====
  if (step === 'feedback') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12">
        <div className="max-w-sm w-full animate-slide-up">
          {feedbackSent ? (
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Feedback sent</h1>
              <p className="mt-2 text-sm text-gray-500">Thank you! {bizInfo.business_name} will see your feedback.</p>
              <Button className="mt-6 w-full" onClick={() => setStep('done')}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center">Private feedback</h1>
              <p className="mt-2 text-sm text-gray-500 text-center">
                This goes directly to {bizInfo.business_name}. It won't be posted publicly.
              </p>
              <div className="mt-6">
                <Textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share your thoughts with the business..."
                  rows={5}
                />
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="ghost" onClick={() => setStep('review')}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={submitFeedback} disabled={!feedbackMessage.trim()}>
                  Send feedback
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== Done step =====
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6">
        <div className="max-w-sm w-full text-center animate-scale-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-5">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Thank you!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your review has been copied. Paste it on Google and post it to help {bizInfo.business_name}.
          </p>
          <div className="mt-6 space-y-3">
            {bizInfo.business_google_review_url && (
              <a
                href={bizInfo.business_google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white px-6 py-3.5 text-base font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-5 w-5" /> Open Google Reviews
              </a>
            )}
            {!feedbackSent && (
              <button
                onClick={() => setStep('feedback')}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                <MessageSquare className="h-4 w-4" /> Send private feedback
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
