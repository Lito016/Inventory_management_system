import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(handleSupabaseError(resetError));
        return;
      }
      setSent(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Mail className="h-12 w-12 text-link mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h2>
          <p className="text-sm text-gray-600 mb-6">
            We sent a password reset link to your email address.
          </p>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-link hover:text-link-hover"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
