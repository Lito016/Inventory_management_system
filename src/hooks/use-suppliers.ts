import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Supplier } from '@/types';

interface UseSuppliersFilters {
  search?: string;
  is_active?: boolean;
  page: number;
  pageSize?: number;
}

export function useSuppliers(filters: UseSuppliersFilters) {
  const { search = '', is_active, page = 0, pageSize = 20 } = filters;

  return useQuery({
    queryKey: ['suppliers', { search, is_active, page, pageSize }],
    queryFn: async () => {
      let q = supabase
        .from('suppliers')
        .select('*', { count: 'exact' });

      if (search) {
        q = q.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (is_active !== undefined) {
        q = q.eq('is_active', is_active);
      }

      q = q.order('name', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as Supplier[], total: count ?? 0 };
    },
  });
}

export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Supplier;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Supplier;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Supplier;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}
