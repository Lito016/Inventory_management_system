/**
 * Map Supabase error codes to user-friendly messages.
 */
export function handleSupabaseError(error: unknown): string {
  const err = error as { code?: string; message?: string };
  const errorMap: Record<string, string> = {
    '23505': 'A record with this name/number already exists.',
    '23503': 'Cannot delete — this record is referenced by other data.',
    '23514': 'Invalid value — please check the field requirements.',
    '42501': "You don't have permission to perform this action.",
    'PGRST116': 'Record not found — it may have been deleted.',
    'PGRST301': 'Too many results — please narrow your search.',
  };

  if (err.code && errorMap[err.code]) {
    return errorMap[err.code];
  }

  // Auth errors
  if (err.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (err.message?.includes('Email not confirmed')) {
    return 'Please verify your email address before logging in.';
  }

  return err.message || 'An unexpected error occurred. Please try again.';
}
