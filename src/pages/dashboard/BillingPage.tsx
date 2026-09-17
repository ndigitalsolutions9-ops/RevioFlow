import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Button, Badge } from '@/components/ui';
import type { Business, Subscription } from '@/lib/types';

export function BillingPage() {
  const { business } = useOutletContext<{ business: Business | null }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      if (!business) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(data as Subscription | null);
      setLoading(false);
    }
    loadSubscription();
  }, [business]);

  const plans = [
    { id: '6_months', label: '6 Months', price: '₹1,999', period: 'for 6 months', features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code'] },
    { id: '12_months', label: '12 Months', price: '₹2,999', period: 'for 12 months', bestValue: true, features: ['1 business', '1 location', '1 Google Business Profile', 'AI review generation', 'Analytics dashboard', 'QR code', 'Save ₹999 vs 6-month plan'] },
  ];

  const statusVariant = { trial: 'info' as const, active: 'success' as const, expired: 'error' as const, cancelled: 'default' as const };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your subscription plan.</p>

      {/* Current subscription */}
      {!loading && subscription && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Current Plan</h2>
                <Badge variant={statusVariant[subscription.status]}>{subscription.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {subscription.plan === '6_months' ? '6 Months' : '12 Months'} plan
              </p>
            </div>
            {subscription.expires_at && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" /> Expires
                </div>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {new Date(subscription.expires_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Plans */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className={`p-6 relative ${plan.bestValue ? 'border-blue-300 ring-1 ring-blue-200' : ''}`}>
            {plan.bestValue && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="info">Best Value</Badge>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{plan.price}</p>
            <p className="text-xs text-gray-500">{plan.period}</p>
            <ul className="mt-5 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500" /> {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full" variant={plan.bestValue ? 'primary' : 'outline'} disabled>
              {subscription?.plan === plan.id ? 'Current Plan' : 'Choose Plan'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Payment integration note */}
      <Card className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Payment Integration Coming Soon</h3>
            <p className="mt-1 text-xs text-gray-600">
              We're integrating Razorpay for secure payments. Your trial includes full access until the payment system is ready.
              No payment is required right now.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
        <p className="font-medium mb-1">What's included:</p>
        <p>One subscription covers 1 business, 1 location, and 1 Google Business Profile.</p>
      </div>
    </div>
  );
}
