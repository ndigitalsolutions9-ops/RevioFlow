import type { AIReviewRequest, AIReviewResponse } from '@/lib/types';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-review`;

export async function generateReview(
  sessionToken: string,
  request: AIReviewRequest
): Promise<AIReviewResponse> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      sessionToken,
      ...request,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error ?? `Request failed (${response.status})`;
    return { review: '', error: message };
  }

  const data = await response.json();
  return { review: data.review ?? '', error: data.error };
}
