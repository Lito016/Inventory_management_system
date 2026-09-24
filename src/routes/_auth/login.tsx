import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, ShieldCheck, UserRound, Boxes } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DEMO_ACCOUNTS = [
  { email: 'admin@ims.local', label: 'Admin', description: 'Full access to all modules', icon: ShieldCheck },
  { email: 'staff@ims.local', label: 'Staff', description: 'Restricted views and actions', icon: UserRound },
];

// Signs in and validates the profile. Returns an error message, or null on success.
async function completeSignIn(email: string, password: string): Promise<string | null> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    return handleSupabaseError(authError);
  }

  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', authData.user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      return 'Account deactivated. Contact administrator.';
    }

    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);
  }

  return null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoAccount, setDemoAccount] = useState<string | null>(null);
  const demo = isDemoMode();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const finish = async (email: string, password: string) => {
    const errorMessage = await completeSignIn(email, password);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      await finish(data.email, data.password);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDemoSignIn = async (email: string) => {
    setError(null);
    setDemoAccount(email);
    try {
      await finish(email, 'demo');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setDemoAccount(null);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-xl shadow-lg ring-1 ring-gray-900/5 border-0 p-8">
        <div className="text-center mb-7">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-violet-500 shadow-glow mb-3">
            <Boxes className="h-6 w-6 text-on-accent" />
          </div>
          <div className="inline-flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-gray-900 tracking-tight">IMS</h1>
            {demo && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Demo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Inventory Management System</p>
        </div>

        {demo && (
          <div className="space-y-2 mb-6">
            {DEMO_ACCOUNTS.map(({ email, label, description, icon: Icon }) => (
              <button
                key={email}
                type="button"
                onClick={() => onDemoSignIn(email)}
                disabled={demoAccount !== null}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-canvas px-4 py-3 text-left transition-all duration-150 hover:border-primary-400 hover:bg-primary-50/60 hover:shadow-sm disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-link">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">Continue as {label}</span>
                  <span className="block truncate text-xs text-gray-600">{description}</span>
                </span>
                {demoAccount === email && (
                  <span className="ml-auto text-xs text-gray-500">Signing in…</span>
                )}
              </button>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-600">or sign in manually</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-error-50 border border-error-500/30 text-sm text-error-700" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-link hover:text-link-hover"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
