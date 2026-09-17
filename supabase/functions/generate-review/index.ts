// AI Review Generation Edge Function
// Provider-agnostic: swap AI providers by changing only the provider module below.
// The function receives structured input and returns a natural review based on
// the customer's genuine input. It NEVER invents experiences or facts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReviewRequest {
  sessionToken: string;
  businessName: string;
  businessCategory: string;
  rating: number;
  selectedTopics: string[];
  customerComment: string | null;
  requestedStyle: "standard" | "shorter" | "detailed";
}

// ============================================
// PROVIDER INTERFACE — swap this to change AI providers
// ============================================
// To use OpenAI: set OPENAI_API_KEY secret, uncomment the openaiGenerate function
// To use Gemini: set GEMINI_API_KEY secret, uncomment the geminiGenerate function
// To use another provider: implement the same interface

interface AIProvider {
  generate(prompt: string): Promise<string>;
}

// --- Template-based fallback (no API key required) ---
// This produces a natural review from the customer's input without calling any
// external AI API. It's used when no provider API key is configured.
function templateGenerate(request: ReviewRequest): string {
  const { businessName, rating, selectedTopics, customerComment, requestedStyle } = request;

  const ratingWord =
    rating === 5 ? "excellent" :
    rating === 4 ? "good" :
    rating === 3 ? "okay" :
    rating === 2 ? "disappointing" :
    "poor";

  let review = `I had ${ratingWord === "excellent" ? "an" : "a"} ${ratingWord} experience at ${businessName}`;

  if (selectedTopics.length > 0) {
    const topicStr = selectedTopics.length === 1
      ? selectedTopics[0]
      : selectedTopics.slice(0, -1).join(", ") + " and " + selectedTopics[selectedTopics.length - 1];
    review += `. The ${topicStr} stood out to me`;
  }

  if (customerComment && customerComment.trim()) {
    review += `. ${customerComment.trim()}`;
  } else {
    review += ".";
  }

  if (requestedStyle === "detailed" && selectedTopics.length > 0) {
    const details = selectedTopics.map(t => `The ${t.toLowerCase()} was ${ratingWord}`).join(". ");
    review += ` ${details}.`;
  }

  if (requestedStyle === "shorter") {
    // Keep it concise — just the first sentence or two
    const sentences = review.split(". ");
    review = sentences.slice(0, 2).join(". ") + ".";
  }

  return review;
}

// --- OpenAI provider (uncomment when OPENAI_API_KEY is set) ---
// async function openaiGenerate(prompt: string): Promise<string> {
//   const apiKey = Deno.env.get("OPENAI_API_KEY");
//   if (!apiKey) throw new Error("OpenAI API key not configured");
//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: SYSTEM_PROMPT },
//         { role: "user", content: prompt },
//       ],
//       max_tokens: 300,
//       temperature: 0.7,
//     }),
//   });
//   if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
//   const data = await response.json();
//   return data.choices?.[0]?.message?.content?.trim() ?? "";
// }

// --- Gemini provider (uncomment when GEMINI_API_KEY is set) ---
// async function geminiGenerate(prompt: string): Promise<string> {
//   const apiKey = Deno.env.get("GEMINI_API_KEY");
//   if (!apiKey) throw new Error("Gemini API key not configured");
//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
//         generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
//       }),
//     }
//   );
//   if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
//   const data = await response.json();
//   return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
// }

// ============================================
// SYSTEM PROMPT — enforces product principles
// ============================================
const SYSTEM_PROMPT = `You help customers write genuine Google reviews based on their own input.

CRITICAL RULES:
- Use ONLY the information the customer provided: their rating, selected topics, and optional comment.
- NEVER invent experiences, services, staff names, prices, or facts the customer did not mention.
- Do NOT keyword-stuff or add SEO-style language.
- Write in natural, conversational human language.
- Keep the review concise and authentic.
- Use the business name naturally when appropriate.
- Match the tone to the rating (5 stars = positive, 1 star = critical, etc.) but stay factual.
- Do not add disclaimers or meta-commentary about AI.`;

function buildPrompt(request: ReviewRequest): string {
  const styleInstruction =
    request.requestedStyle === "shorter" ? "Keep it to 1-2 sentences." :
    request.requestedStyle === "detailed" ? "Write 3-4 sentences with natural detail." :
    "Write 2-3 sentences.";

  const topicStr = request.selectedTopics.length > 0
    ? request.selectedTopics.join(", ")
    : "none selected";

  const commentStr = request.customerComment?.trim()
    ? request.customerComment.trim()
    : "no additional comment";

  return `Write a Google review for ${request.businessName} (category: ${request.businessCategory}).

Customer's input:
- Rating: ${request.rating} out of 5 stars
- Topics mentioned: ${topicStr}
- Customer's comment: ${commentStr}

${styleInstruction}

Write only the review text, no preamble or explanation.`;
}

// ============================================
// RATE LIMITING
// ============================================
async function checkRateLimit(supabase: any, sessionToken: string): Promise<boolean> {
  const { data } = await supabase.rpc("check_ai_rate_limit", { p_session_token: sessionToken });
  return data === true;
}

async function logGeneration(supabase: any, sessionToken: string): Promise<void> {
  await supabase.rpc("log_ai_generation", { p_session_token: sessionToken });
}

// ============================================
// INPUT VALIDATION
// ============================================
function validateInput(body: ReviewRequest): string | null {
  if (!body.sessionToken) return "Missing session token";
  if (!body.businessName || body.businessName.length > 200) return "Invalid business name";
  if (!body.businessCategory || body.businessCategory.length > 100) return "Invalid business category";
  if (!body.rating || body.rating < 1 || body.rating > 5) return "Invalid rating";
  if (!Array.isArray(body.selectedTopics)) return "Invalid topics";
  if (body.selectedTopics.length > 20) return "Too many topics selected";
  if (body.customerComment && body.customerComment.length > 2000) return "Comment too long";
  if (!["standard", "shorter", "detailed"].includes(body.requestedStyle)) return "Invalid style";
  return null;
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ReviewRequest = await req.json();

    // Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for DB operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("npm:@supabase/supabase-js@2.57.4");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limit
    const allowed = await checkRateLimit(supabase, body.sessionToken);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt
    const prompt = buildPrompt(body);

    // Select provider — uses template fallback if no API key is set
    // To enable a real AI provider, uncomment its function above and set the
    // corresponding environment variable (OPENAI_API_KEY or GEMINI_API_KEY).
    let review: string;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (openaiKey) {
      // Uncomment when openaiGenerate is implemented
      // review = await retryWithBackoff(() => openaiGenerate(prompt));
      review = templateGenerate(body); // Fallback until provider is uncommented
    } else if (geminiKey) {
      // Uncomment when geminiGenerate is implemented
      // review = await retryWithBackoff(() => geminiGenerate(prompt));
      review = templateGenerate(body); // Fallback until provider is uncommented
    } else {
      // Template-based fallback — no external API call needed
      review = templateGenerate(body);
    }

    // Log the generation for rate limiting
    await logGeneration(supabase, body.sessionToken);

    return new Response(
      JSON.stringify({ review }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-review error:", err);
    return new Response(
      JSON.stringify({ error: "Could not generate review. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Retry with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  throw lastError ?? new Error("Request failed after retries");
}
