import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { VReceivable, Payment } from '@/types';

interface UseReceivablesFilters {
  search?: string;
  status?: string;
  customer_id?: string;
  page: number;
  pageSize?: number;
}

export function useReceivables(filters: UseReceivablesFilters) {
  const { search = '', status, customer_id, page = 0, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['receivables', { search, status, customer_id, page, pageSize }],
    queryFn: async () => {
      let q = supabase
        .from('v_receivables')
        .select('*', { count: 'exact' });

      if (search) {
        q = q.or(`customer_name.ilike.%${search}%,notes.ilike.%${search}%`);
      }
      if (status) {
        q = q.eq('status', status);
      }
      if (customer_id) {
        q = q.eq('customer_id', customer_id);
      }

      q = q.order('due_date', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as VReceivable[], total: count ?? 0 };
    },
  });
}

export function useReceivable(id: string | null) {
  return useQuery({
    queryKey: ['receivables', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('v_receivables')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as VReceivable;
    },
    enabled: !!id,
  });
}

export function useReceivablePayments(receivableId: string | null) {
  return useQuery({
    queryKey: ['payments', 'receivable', receivableId],
    queryFn: async () => {
      if (!receivableId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*, recorded_by_profile:profiles!payments_recorded_by_fkey(full_name)')
        .eq('source_id', receivableId)
        .eq('payment_type', 'receivable')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as (Payment & { recorded_by_profile?: { full_name: string } })[];
    },
    enabled: !!receivableId,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'is_voided' | 'void_reason' | 'voided_by' | 'voided_at'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      if (error) throw error;
      return data as Payment;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [
        { count: totalReceivables },
        { count: overdueReceivables },
        { data: receivableSum },
        { data: payableSum },
      ] = await Promise.all([
        supabase.from('v_receivables').select('*', { count: 'exact', head: true })
          .in('status', ['Outstanding', 'Partially Paid']),
        supabase.from('v_receivables').select('*', { count: 'exact', head: true })
          .in('status', ['Outstanding', 'Partially Paid'])
          .eq('is_overdue', true),
        supabase.from('v_receivables').select('outstanding_balance')
          .in('status', ['Outstanding', 'Partially Paid']),
        supabase.from('v_payables').select('outstanding_balance')
          .in('status', ['Outstanding', 'Partially Paid']),
      ]);

      const totalReceivableOutstanding = (receivableSum ?? [])
        .reduce((sum, r) => sum + parseFloat(r.outstanding_balance as string), 0);
      const totalPayableOutstanding = (payableSum ?? [])
        .reduce((sum, p) => sum + parseFloat(p.outstanding_balance as string), 0);

      return {
        totalReceivables: totalReceivables ?? 0,
        overdueCount: overdueReceivables ?? 0,
        totalReceivableOutstanding,
        totalPayableOutstanding,
      };
    },
  });
}
