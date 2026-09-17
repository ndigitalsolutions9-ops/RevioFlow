import { Link } from 'react-router-dom';
import { Star, Check, ArrowRight } from 'lucide-react';
import { branding } from '@/config/branding';

export function PricingPage() {
  const plans = [
    {
      label: '6 Months',
      price: '₹1,999',
      period: 'for 6 months',
      features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code', 'Private feedback management'],
    },
    {
      label: '12 Months',
      price: '₹2,999',
      period: 'for 12 months',
      bestValue: true,
      features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code', 'Private feedback management', 'Save ₹999 vs 6-month plan'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Star className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-gray-900">{branding.name}</span>
          </Link>
          <Link to="/signup" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Start Free</Link>
        </div>
      </nav>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center">Simple, transparent pricing</h1>
          <p className="mt-4 text-gray-500 text-center max-w-xl mx-auto">
            One subscription covers one business, one location, and one Google Business Profile.
            No hidden fees.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.label} className={`rounded-2xl border-2 p-8 ${plan.bestValue ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-200' : 'border-gray-200'}`}>
                {plan.bestValue && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 mb-3">
                    <Star className="h-3 w-3 fill-current" /> Best Value
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-900">{plan.label}</h2>
                <p className="mt-2 text-4xl font-bold text-gray-900">{plan.price}</p>
                <p className="text-sm text-gray-500">{plan.period}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors w-full">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-gray-50 border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900">What's included in every plan</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                'Custom QR code for your business',
                'AI-assisted review writing',
                'Analytics dashboard with conversion funnel',
                'Private feedback management',
                'Customizable review topics',
                'QR code download (PNG & SVG)',
                'AI business insights',
                '14-day free trial',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" /> {item}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Payment integration via Razorpay is coming soon. Your free trial includes full access — no payment required.
          </p>
        </div>
      </section>
    </div>
  );
}
