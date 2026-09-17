import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Plus, X, GripVertical, ArrowUp, ArrowDown, Upload, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { businessCategories, getCategoryLabel, getSuggestedTopics } from '@/config/categories';
import { Card, Button, Input, Badge } from '@/components/ui';
import type { Business, ReviewTopic } from '@/lib/types';

export function SettingsPage() {
  const { business, setBusiness } = useOutletContext<{ business: Business | null; setBusiness: (b: Business) => void }>();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [topics, setTopics] = useState<ReviewTopic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'topics' | 'google' | 'account'>('profile');

  useEffect(() => {
    if (business) {
      setName(business.name);
      setCategory(business.category);
      setGoogleReviewUrl(business.google_review_url ?? '');
      setWelcomeMessage(business.welcome_message ?? '');
      setLogoUrl(business.logo_url ?? '');
    }
  }, [business]);

  useEffect(() => {
    async function loadTopics() {
      if (!business) return;
      const { data } = await supabase
        .from('review_topics')
        .select('*')
        .eq('business_id', business.id)
        .order('display_order');
      setTopics((data as ReviewTopic[]) ?? []);
    }
    loadTopics();
  }, [business]);

  async function saveProfile() {
    if (!business) return;
    setSaving(true);
    setSaved(false);
    const { data, error } = await supabase
      .from('businesses')
      .update({
        name,
        category,
        google_review_url: googleReviewUrl || null,
        welcome_message: welcomeMessage || null,
        logo_url: logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id)
      .select()
      .single();
    if (!error && data) {
      setBusiness(data as Business);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function saveTopics() {
    if (!business) return;
    setSaving(true);
    for (const topic of topics) {
      await supabase.from('review_topics').update({ label: topic.label, display_order: topic.display_order, active: topic.active }).eq('id', topic.id);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  function addTopic() {
    if (!business || !newTopic.trim()) return;
    supabase
      .from('review_topics')
      .insert({ business_id: business.id, label: newTopic.trim(), display_order: topics.length, active: true })
      .select()
      .single()
      .then(({ data }) => {
        if (data) setTopics([...topics, data as ReviewTopic]);
        setNewTopic('');
      });
  }

  function deleteTopic(id: string) {
    supabase.from('review_topics').delete().eq('id', id);
    setTopics(topics.filter((t) => t.id !== id));
  }

  function moveTopic(index: number, dir: -1 | 1) {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= topics.length) return;
    const newTopics = [...topics];
    [newTopics[index], newTopics[newIndex]] = [newTopics[newIndex], newTopics[index]];
    const reordered = newTopics.map((t, i) => ({ ...t, display_order: i }));
    setTopics(reordered);
  }

  function toggleTopicActive(id: string) {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    supabase.from('review_topics').update({ active: !topic.active }).eq('id', id);
    setTopics(topics.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  const tabs = [
    { key: 'profile' as const, label: 'Business Profile' },
    { key: 'topics' as const, label: 'Review Topics' },
    { key: 'google' as const, label: 'Google Review Link' },
    { key: 'account' as const, label: 'Account' },
  ];

  if (!business) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your business profile and preferences.</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="space-y-4">
              <Input label="Business Name" value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {businessCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <Input label="Welcome Message" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="How was your experience at...?" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Logo</h2>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
                  <button onClick={() => setLogoUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex-col items-center justify-center gap-1 hover:border-blue-500">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Upload</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
              <p className="text-xs text-gray-400">PNG or JPG, max 2MB</p>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} loading={saving}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          </div>
        </div>
      )}

      {/* Topics tab */}
      {activeTab === 'topics' && (
        <div className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Review Topics</h2>
            <p className="text-xs text-gray-500 mb-4">These tags appear for customers during the review flow.</p>
            <div className="space-y-2">
              {topics.map((topic, i) => (
                <div key={topic.id} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <input
                    value={topic.label}
                    onChange={(e) => {
                      const newTopics = [...topics];
                      newTopics[i] = { ...topic, label: e.target.value };
                      setTopics(newTopics);
                    }}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <button onClick={() => moveTopic(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 p-0.5 disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveTopic(i, 1)} disabled={i === topics.length - 1} className="text-gray-400 hover:text-gray-600 p-0.5 disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => toggleTopicActive(topic.id)} className="p-0.5">
                    <Badge variant={topic.active ? 'success' : 'default'}>{topic.active ? 'Active' : 'Hidden'}</Badge>
                  </button>
                  <button onClick={() => deleteTopic(topic.id)} className="text-gray-400 hover:text-red-500 p-0.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())} placeholder="Add a new topic..." className="flex-1" />
              <Button variant="outline" onClick={addTopic}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
              <p className="font-medium mb-1">Suggested topics for {getCategoryLabel(category)}:</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {getSuggestedTopics(category).filter((s) => !topics.some((t) => t.label === s)).map((s) => (
                  <button key={s} onClick={() => { setNewTopic(s); addTopic(); }} className="rounded-full bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>
          <Button onClick={saveTopics} loading={saving}>
            <Save className="h-4 w-4" /> Save topics
          </Button>
        </div>
      )}

      {/* Google link tab */}
      {activeTab === 'google' && (
        <div className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Google Review Link</h2>
            <p className="text-xs text-gray-500 mb-4">Paste the direct link where customers can write a Google review for your business.</p>
            <Input value={googleReviewUrl} onChange={(e) => setGoogleReviewUrl(e.target.value)} placeholder="https://www.google.com/maps/place/..." />
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
              To find your link: Go to your Google Business Profile, click "Get more reviews," and copy the link.
            </div>
          </Card>
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} loading={saving}>
              <Save className="h-4 w-4" /> Save link
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="mt-4 space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Business slug</span>
                <span className="text-sm font-medium text-gray-900 font-mono">/r/{business.slug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Member since</span>
                <span className="text-sm font-medium text-gray-900">{new Date(business.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
