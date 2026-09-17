import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { getSuggestedTopics } from '@/config/categories';
import { Button, Input, Textarea, Card } from '@/components/ui';
import { Star, Store, Tag, Link2, Image, QrCode, ArrowRight, ArrowLeft, Check, Plus, X, GripVertical, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import type { Business } from '@/lib/types';

const TOTAL_STEPS = 6;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step data
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Check if user already has a business
  useEffect(() => {
    async function checkExistingBusiness() {
      if (!user) return;
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (data) {
        navigate('/dashboard');
      }
    }
    checkExistingBusiness();
  }, [user, navigate]);

  // Auto-suggest topics when category changes
  useEffect(() => {
    if (category && topics.length === 0) {
      setTopics(getSuggestedTopics(category));
    }
  }, [category, topics.length]);

  const reviewUrl = business ? `${window.location.origin}/r/${business.slug}` : '';

  useEffect(() => {
    if (reviewUrl) {
      QRCode.toDataURL(reviewUrl, { width: 400, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [reviewUrl]);

  const handleCreateBusiness = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    let slug = slugify(businessName);
    if (!slug) slug = `biz-${Date.now()}`;

    // Ensure slug uniqueness
    const { data: existing } = await supabase
      .from('businesses')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const { data: bizData, error: bizError } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: businessName,
        slug,
        category,
        google_review_url: googleReviewUrl || null,
        logo_url: logoUrl || null,
        welcome_message: `How was your experience at ${businessName}?`,
      })
      .select()
      .single();

    if (bizError || !bizData) {
      setError('Could not create your business. Please try again.');
      setSaving(false);
      return;
    }

    // Insert topics
    if (topics.length > 0) {
      const topicInserts = topics.map((label, index) => ({
        business_id: bizData.id,
        label,
        display_order: index,
        active: true,
      }));
      await supabase.from('review_topics').insert(topicInserts);
    }

    // Create trial subscription
    await supabase.from('subscriptions').insert({
      business_id: bizData.id,
      plan: '6_months',
      status: 'trial',
      starts_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setBusiness(bizData as Business);
    setSaving(false);
  }, [user, businessName, category, googleReviewUrl, logoUrl, topics]);

  const nextStep = () => {
    if (step === 4) {
      handleCreateBusiness();
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const addTopic = () => {
    const trimmed = newTopic.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const moveTopic = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= topics.length) return;
    const newTopics = [...topics];
    [newTopics[index], newTopics[newIndex]] = [newTopics[newIndex], newTopics[index]];
    setTopics(newTopics);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canProceed = () => {
    if (step === 0) return businessName.trim().length > 0;
    if (step === 1) return category.length > 0;
    if (step === 2) return true; // Google URL is optional
    if (step === 3) return true; // Logo is optional
    if (step === 4) return topics.length > 0;
    return true;
  };

  const stepIcons = [Store, Tag, Link2, Image, Star, QrCode];
  const stepLabels = ['Business', 'Category', 'Google Link', 'Logo', 'Topics', 'QR Code'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Star className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-gray-900">ReviewFlow</span>
        </div>
        <div className="text-sm text-gray-500">Step {step + 1} of {TOTAL_STEPS}</div>
      </header>

      {/* Progress bar */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-300'}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                    isActive ? 'border-blue-600 bg-blue-50' : isDone ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-[10px] font-medium hidden sm:block">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-xl mx-auto px-6 pb-12">
        <div className="animate-fade-in" key={step}>
          {step === 0 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900">What's your business name?</h2>
              <p className="mt-1.5 text-sm text-gray-500">This is how customers will see you on the review page.</p>
              <div className="mt-6">
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Smile Dental Clinic"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canProceed() && nextStep()}
                />
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900">What type of business is it?</h2>
              <p className="mt-1.5 text-sm text-gray-500">We'll suggest review topics based on your category.</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Dental Clinic', value: 'dental_clinic' },
                  { label: 'Salon', value: 'salon' },
                  { label: 'Restaurant', value: 'restaurant' },
                  { label: 'Cafe', value: 'cafe' },
                  { label: 'Gym', value: 'gym' },
                  { label: 'Jewellery Store', value: 'jewellery_store' },
                  { label: 'Diagnostic Centre', value: 'diagnostic_centre' },
                  { label: 'Service Centre', value: 'service_centre' },
                  { label: 'Small Hotel', value: 'small_hotel' },
                  { label: 'Tuition Centre', value: 'tuition_centre' },
                  { label: 'Retail Store', value: 'retail_store' },
                  { label: 'Other', value: 'other' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      category === cat.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900">Your Google review link</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Paste the direct link where customers write Google reviews for your business.
                You can find this on your Google Business Profile.
              </p>
              <div className="mt-6">
                <Input
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/place/..."
                  autoFocus
                />
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
                Don't have your link yet? You can skip this step and add it later in Settings.
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900">Add your logo</h2>
              <p className="mt-1.5 text-sm text-gray-500">Customers will see this on the review page. Optional but recommended.</p>
              <div className="mt-6 flex flex-col items-center">
                {logoUrl ? (
                  <div className="relative">
                    <img src={logoUrl} alt="Logo preview" className="h-32 w-32 rounded-2xl object-cover border border-gray-200" />
                    <button
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex h-32 w-32 rounded-2xl border-2 border-dashed border-gray-300 flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Click to upload</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                )}
                <p className="mt-3 text-xs text-gray-400">PNG or JPG, max 2MB</p>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900">Customize review topics</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                These tags help customers mention what matters to them. We've suggested some based on your category.
              </p>
              <div className="mt-6 space-y-2">
                {topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 animate-fade-in">
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <input
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [...topics];
                        newTopics[i] = e.target.value;
                        setTopics(newTopics);
                      }}
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                    <button onClick={() => moveTopic(i, -1)} className="text-gray-400 hover:text-gray-600 p-0.5" disabled={i === 0}>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveTopic(i, 1)} className="text-gray-400 hover:text-gray-600 p-0.5" disabled={i === topics.length - 1}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeTopic(i)} className="text-gray-400 hover:text-red-500 p-0.5">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  placeholder="Add a new topic..."
                  className="flex-1"
                />
                <Button variant="outline" onClick={addTopic}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </Card>
          )}

          {step === 5 && business && (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your QR code is ready!</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Display this QR at your counter. Customers scan it to start writing a review.
              </p>

              {qrDataUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm">
                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="mt-3 text-xs text-gray-400 break-all max-w-xs">{reviewUrl}</div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <a href={qrDataUrl} download={`${business.slug}-qr.png`} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
                      <QrCode className="h-4 w-4" /> Download PNG
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(reviewUrl)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Link2 className="h-4 w-4" /> Copy URL
                    </button>
                    <a
                      href={reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Preview Page
                    </a>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Navigation */}
        {step < TOTAL_STEPS - 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={prevStep} disabled={step === 0 || saving}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={nextStep} disabled={!canProceed() || saving} loading={saving}>
              {step === 4 ? 'Create & Generate QR' : 'Continue'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === TOTAL_STEPS - 1 && business && (
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
