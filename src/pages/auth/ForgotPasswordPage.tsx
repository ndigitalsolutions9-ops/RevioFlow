import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { branding } from '@/config/branding';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm animate-slide-up">
        {sent ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">Check your email</h1>
            <p className="mt-2 text-sm text-gray-500 text-center">
              If an account exists for {email}, we've sent a password reset link.
            </p>
            <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" loading={submitting} className="w-full">
                Send reset link
              </Button>
            </form>

            <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
