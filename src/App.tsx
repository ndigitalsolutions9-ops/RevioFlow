import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { LandingPage } from '@/pages/LandingPage';
import { PricingPage } from '@/pages/PricingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { DashboardLayout } from '@/pages/dashboard/DashboardLayout';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage';
import { PrivateFeedbackPage } from '@/pages/dashboard/PrivateFeedbackPage';
import { QRManagementPage } from '@/pages/dashboard/QRManagementPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import { BillingPage } from '@/pages/dashboard/BillingPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { CustomerReviewPage } from '@/pages/customer/CustomerReviewPage';
import { LoadingSpinner } from '@/components/ui';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner className="text-blue-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner className="text-blue-600" /></div>;
  if (!user || profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner className="text-blue-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public marketing routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Customer review flow */}
      <Route path="/r/:slug" element={<CustomerReviewPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <OnboardingRoute><OnboardingPage /></OnboardingRoute>
      } />

      {/* Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<DashboardOverview />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="feedback" element={<PrivateFeedbackPage />} />
        <Route path="qr" element={<QRManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <AdminRoute><AdminPage /></AdminRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
