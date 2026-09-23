import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { HistoricalDebt } from '@/types';

export function useHistoricalDebts(filters: { entity_type?: string; verification_status?: string; page: number }) {
  const { entity_type, verification_status, page = 0 } = filters;
  return useQuery({
    queryKey: ['historical-debts', { entity_type, verification_status, page }],
    queryFn: async () => {
      let q = supabase.from('historical_debts').select('*', { count: 'exact' });
      if (entity_type) q = q.eq('entity_type', entity_type);
      if (verification_status) q = q.eq('verification_status', verification_status);
      q = q.order('debt_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as HistoricalDebt[], total: count ?? 0 };
    },
  });
}

export function useCreateHistoricalDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<HistoricalDebt, 'id' | 'created_at' | 'updated_at' | 'verification_status' | 'adjusted_amount' | 'adjustment_reason' | 'write_off_reason'>) => {
      const { data, error } = await supabase.from('historical_debts').insert({ ...input, verification_status: 'Pending' }).select().single();
      if (error) throw error;
      return data as HistoricalDebt;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['historical-debts'] }),
  });
}

export function useUpdateDebtStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, verification_status, reason }: { id: string; verification_status: string; reason?: string }) => {
      const updates: Record<string, unknown> = { verification_status, updated_at: new Date().toISOString() };
      if (reason) updates.adjustment_reason = reason;
      const { error } = await supabase.from('historical_debts').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['historical-debts'] }),
  });
}
