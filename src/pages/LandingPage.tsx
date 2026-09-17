import { Link } from 'react-router-dom';
import { Star, QrCode, Sparkles, ExternalLink, BarChart3, MessageSquare, Check, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { branding } from '@/config/branding';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Star className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-gray-900">{branding.name}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How It Works</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</a>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
            <Link to="/signup" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Start Free</Link>
          </div>
          <Link to="/signup" className="sm:hidden rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium">Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-medium text-blue-700 mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" /> AI-assisted review writing for local businesses
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight animate-slide-up">
            Turn customer experiences into better reviews.
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto animate-slide-up">
            Make it easier for your customers to express their genuine experience with AI-assisted review writing.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3.5 text-base font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto justify-center">
              Start Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white text-gray-700 px-6 py-3.5 text-base font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center">
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required. Free trial included.</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">How It Works</h2>
          <p className="mt-3 text-gray-500 text-center max-w-xl mx-auto">Three simple steps from scan to review.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'Customer Scans', desc: 'Customer scans your QR code at the counter. No app to install, no account to create.', color: 'text-blue-600 bg-blue-50' },
              { icon: Sparkles, title: 'AI Helps Them Write', desc: 'They rate their experience, pick topics, and AI drafts a genuine review from their input.', color: 'text-amber-600 bg-amber-50' },
              { icon: ExternalLink, title: 'Customer Posts on Google', desc: 'They review the draft, edit if they want, then copy and paste it on Google themselves.', color: 'text-green-600 bg-green-50' },
            ].map((step, i) => (
              <div key={step.title} className="text-center relative">
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} mb-4`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="text-sm font-bold text-gray-300 mb-1">STEP {i + 1}</div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-200">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Everything you need</h2>
          <p className="mt-3 text-gray-500 text-center">Tools to collect genuine reviews and understand your customers.</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: 'Custom QR Code', desc: 'Generate and download a QR code for your counter. Customers scan and start writing instantly.' },
              { icon: Sparkles, title: 'AI Review Writing', desc: 'AI helps customers express their experience naturally, based on their own input. No fake reviews.' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track scans, review starts, AI generations, and Google opens. See your conversion funnel.' },
              { icon: MessageSquare, title: 'Private Feedback', desc: 'Customers can send private feedback too. Manage it with new, seen, and resolved statuses.' },
              { icon: Shield, title: 'Genuine Reviews Only', desc: 'AI never invents experiences. The customer controls and submits the final review on Google.' },
              { icon: Zap, title: 'Fast Mobile Flow', desc: 'Optimized for phones. The entire flow takes less than 30 seconds for your customers.' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Who It's For</h2>
          <p className="mt-3 text-gray-500">Built for small, single-location businesses.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['Dental Clinics', 'Salons', 'Restaurants', 'Cafes', 'Gyms', 'Jewellery Stores', 'Diagnostic Centres', 'Service Centres', 'Small Hotels', 'Tuition Centres', 'Retail Stores'].map((biz) => (
              <span key={biz} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">{biz}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">See Your Dashboard</h2>
          <p className="mt-3 text-gray-500 text-center">Track everything from one clean dashboard.</p>
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'QR Scans', value: '247', icon: QrCode, color: 'text-blue-600' },
                { label: 'Reviews Generated', value: '89', icon: Sparkles, color: 'text-amber-600' },
                { label: 'Google Opened', value: '62', icon: ExternalLink, color: 'text-green-600' },
                { label: 'Avg Rating', value: '4.6', icon: Star, color: 'text-indigo-600' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-gray-100 p-4">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Conversion Funnel</p>
              <div className="space-y-2">
                {[
                  { label: 'QR Scans', pct: 100, color: 'bg-blue-500' },
                  { label: 'Review Started', pct: 72, color: 'bg-purple-500' },
                  { label: 'Review Generated', pct: 36, color: 'bg-amber-500' },
                  { label: 'Google Opened', pct: 25, color: 'bg-green-500' },
                ].map((stage) => (
                  <div key={stage.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28">{stage.label}</span>
                    <div className="flex-1 h-5 rounded-lg bg-gray-200 overflow-hidden">
                      <div className={`h-full ${stage.color} rounded-lg`} style={{ width: `${stage.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Simple Pricing</h2>
          <p className="mt-3 text-gray-500 text-center">One subscription. One business. One location.</p>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {[
              { label: '6 Months', price: '₹1,999', period: 'for 6 months', features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code'] },
              { label: '12 Months', price: '₹2,999', period: 'for 12 months', bestValue: true, features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code', 'Save ₹999'] },
            ].map((plan) => (
              <div key={plan.label} className={`rounded-2xl border-2 p-8 ${plan.bestValue ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}`}>
                {plan.bestValue && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 mb-3">
                    <Star className="h-3 w-3 fill-current" /> Best Value
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
                <p className="mt-2 text-4xl font-bold text-gray-900">{plan.price}</p>
                <p className="text-sm text-gray-500">{plan.period}</p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">FAQ</h2>
          <div className="mt-10 space-y-4">
            {[
              { q: 'Does this create fake reviews?', a: 'No. ReviewFlow helps customers write genuine reviews based on their own input. The AI never invents experiences, staff names, or facts. The customer controls and submits the final review on Google.' },
              { q: 'Does it automatically post to Google?', a: 'No. The customer copies the review text and pastes it on Google themselves. We never submit reviews automatically. We open the Google review page for the customer and they do the posting.' },
              { q: 'Do you filter negative reviews?', a: 'No. Every customer, regardless of their rating, follows the same flow and gets the same ability to generate and post a Google review. We also offer private feedback for all customers.' },
              { q: 'Is it affiliated with Google?', a: 'No. ReviewFlow is not affiliated with Google. We simply help customers express their experience and direct them to your Google review page.' },
              { q: 'How long does it take for a customer?', a: 'Less than 30 seconds. They scan the QR, rate their experience, pick topics, and the AI drafts a review they can edit and post.' },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl bg-white border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-12 lg:p-16">
          <h2 className="text-3xl font-bold text-white">Start collecting better reviews today</h2>
          <p className="mt-3 text-blue-100">Free trial. No credit card required. Set up in minutes.</p>
          <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-blue-600 px-6 py-3.5 text-base font-medium hover:bg-blue-50 transition-colors">
            Start Free <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Star className="h-4 w-4" fill="currentColor" />
              </div>
              <span className="font-bold text-gray-900">{branding.name}</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-400 max-w-2xl mx-auto">
            AI assists customers in writing reviews based on their own input. The customer controls and submits the final review.
            {branding.name} is not affiliated with Google.
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} {branding.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
