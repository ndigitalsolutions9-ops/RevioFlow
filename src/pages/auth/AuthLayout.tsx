import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { branding } from '@/config/branding';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Star className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="text-lg font-bold text-gray-900">{branding.name}</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        {children}
      </div>
    </div>
  );
}
