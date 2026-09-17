# ReviewFlow

AI-assisted Google review platform for small, single-location businesses.

ReviewFlow helps businesses collect genuine Google reviews by making it easy for customers to express their real experience. Customers scan a QR code, rate their experience, select topics, and the AI helps them write a natural review based on their input. The customer then copies and pastes the review on Google themselves.

## Product Principles

- **No fake reviews.** AI only helps customers express their genuine experience based on information they provide.
- **No automatic submission.** The customer always submits the final review on Google.
- **No filtering.** Positive, neutral, and negative customers follow the same workflow.
- **No affiliation with Google.** ReviewFlow is an independent tool.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React
- **QR Codes:** qrcode (npm)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Row Level Security)
- **AI:** Provider-agnostic edge function (OpenAI/Gemini ready, template fallback active)

## Architecture

```
src/
├── config/          # Branding and business categories
├── lib/             # Supabase client, auth context, types, analytics, AI client
├── components/ui/   # Shared UI components (Button, Card, Input, etc.)
├── pages/
│   ├── auth/        # Login, signup, forgot password
│   ├── onboarding/  # 6-step business setup wizard
│   ├── customer/    # Public customer review flow (/r/:slug)
│   ├── dashboard/   # Owner dashboard (overview, analytics, feedback, QR, settings, billing)
│   └── admin/      # Admin foundation
├── App.tsx          # Routes
└── main.tsx         # Entry point

supabase/
├── config.toml      # Edge function config
└── functions/
    └── generate-review/  # AI review generation edge function
```

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users with role (user/admin) |
| `businesses` | Business info (name, slug, category, logo, Google review URL) |
| `review_topics` | Configurable tags for customer review flow |
| `review_sessions` | Anonymous customer sessions with rating, comment, generated review |
| `review_session_topics` | Join table linking sessions to selected topics |
| `private_feedback` | Private feedback from customers to business |
| `analytics_events` | Event tracking (qr_page_view, review_started, etc.) |
| `subscriptions` | Business subscription plans and status |
| `ai_generation_log` | Rate limiting for AI generation |

### Security

- **Row Level Security** enabled on every table
- Business owners can only access their own business's data
- Public customers can only see business info needed for the review flow
- No customer can query another customer's session or private feedback
- Sensitive mutations happen through SECURITY DEFINER functions
- Column-level privileges prevent users from forging `owner_id`, `role`, or subscription `status`

### Migrations

Two migrations are applied via the Supabase MCP tool:

1. `create_core_schema` — Creates all tables, indexes, and constraints
2. `create_rls_and_functions` — Enables RLS, creates policies, and SECURITY DEFINER functions

## Environment Variables

All Supabase variables are pre-populated:

```
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### AI Provider Keys (Optional)

To enable a real AI provider instead of the template fallback, set one of these as a Supabase Edge Function secret:

- `OPENAI_API_KEY` — For OpenAI (e.g., GPT-4o-mini)
- `GEMINI_API_KEY` — For Google Gemini (e.g., Gemini 1.5 Flash)

Then uncomment the corresponding provider function in `supabase/functions/generate-review/index.ts`.

Without any key, the edge function uses a template-based fallback that generates a natural review from the customer's input without calling any external API.

## AI Architecture

The `generate-review` edge function is provider-agnostic:

1. It receives structured input (businessName, businessCategory, rating, selectedTopics, customerComment, requestedStyle)
2. Validates and sanitizes input
3. Checks rate limits (10 per session, 50 per business per hour)
4. Calls the configured AI provider (or template fallback)
5. Returns the generated review text

To swap providers, change only the provider module inside the edge function. The rest of the app is unaffected.

### System Prompt Rules

The AI is instructed to:
- Use ONLY the customer's provided input
- Never invent experiences, staff, services, or facts
- Write in natural, conversational language
- Keep reviews concise
- Match tone to rating without being dishonest

## Local Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run typecheck # Type checking
npm run lint     # ESLint
```

## Deployment

The app deploys automatically via Bolt. The Supabase database, auth, and edge functions are already provisioned.

## Future Integrations

### Google Business Profile API

The `google_review_url` field on the `businesses` table stores the direct review link. When the Google Business Profile API is integrated:

1. Add API credentials as edge function secrets
2. Create an edge function to fetch/verify the review URL
3. Optionally verify when a review is actually posted

### Razorpay Payments

The `subscriptions` table supports `plan`, `status`, `starts_at`, `expires_at`, and `payment_reference`. To integrate Razorpay:

1. Add Razorpay key/secret as edge function secrets
2. Create an edge function to create Razorpay orders
3. Add a webhook edge function to handle payment events
4. Update subscription status from `trial` to `active` on payment confirmation
5. The subscription guard middleware is already prepared to restrict expired accounts

## Branding

All branding (name, colors, domain) is centralized in `src/config/branding.ts`. Change it there to rebrand the entire app.
