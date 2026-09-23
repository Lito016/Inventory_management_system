import { useMemo } from 'react';
import { useAuth } from './use-auth';

export function useRole() {
  const { profile } = useAuth();

  const isAdmin = useMemo(() => profile?.role === 'admin', [profile?.role]);
  const isStaff = useMemo(() => profile?.role === 'staff', [profile?.role]);

  return { role: profile?.role ?? null, isAdmin, isStaff };
}
