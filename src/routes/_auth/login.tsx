import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/utils/validators';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(handleSupabaseError(authError));
        return;
      }

      // Check if account is deactivated
      if (authData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', authData.user.id)
          .single();

        if (profile && !profile.is_active) {
          await supabase.auth.signOut();
          setError('Account deactivated. Contact administrator.');
          return;
        }

        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', authData.user.id);
      }

      navigate('/dashboard', { replace: true });
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">IMS</h1>
          <p className="text-sm text-gray-500 mt-1">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-error-50 border border-error-200 text-sm text-error-700">
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
              className="text-xs text-primary-600 hover:text-primary-700"
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
