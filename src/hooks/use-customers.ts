import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Customer } from '@/types';

interface UseCustomersFilters {
  search?: string;
  type?: string;
  is_active?: boolean;
  page: number;
  pageSize?: number;
}

export function useCustomers(filters: UseCustomersFilters) {
  const { search = '', type, is_active, page = 0, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['customers', { search, type, is_active, page, pageSize }],
    queryFn: async () => {
      let q = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      if (search) {
        q = q.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (type) {
        q = q.eq('type', type);
      }
      if (is_active !== undefined) {
        q = q.eq('is_active', is_active);
      }

      q = q.order('name', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as Customer[], total: count ?? 0 };
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Customer;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Customer;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
