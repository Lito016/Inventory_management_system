import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Product, B2BPreOrder, B2BPreOrderItem, B2BPurchaseOrder, B2BPOItem, B2BReceivingRecord, B2BReceivingItem, B2BFulfillment, B2BFulfillmentItem } from '@/types';

// ============ PRODUCTS ============

export function useProducts(filters: { search?: string; page: number; pageSize?: number }) {
  const { search = '', page = 0, pageSize = 20 } = filters;
  return useQuery({
    queryKey: ['products', { search, page, pageSize }],
    queryFn: async () => {
      let q = supabase.from('products').select('*', { count: 'exact' });
      if (search) q = q.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
      q = q.order('name').range(page * pageSize, (page + 1) * pageSize - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as Product[], total: count ?? 0 };
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('products').insert(input).select().single();
      if (error) throw error;
      return data as Product;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase.from('products').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data as Product;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

// ============ B2B PRE-ORDERS ============

export function usePreOrders(filters: { status?: string; customer_id?: string; page: number }) {
  const { status, customer_id, page = 0 } = filters;
  return useQuery({
    queryKey: ['pre-orders', { status, customer_id, page }],
    queryFn: async () => {
      let q = supabase.from('b2b_pre_orders').select('*, customer:customers(name)', { count: 'exact' });
      if (status) q = q.eq('status', status);
      if (customer_id) q = q.eq('customer_id', customer_id);
      q = q.order('order_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as (B2BPreOrder & { customer: { name: string } })[], total: count ?? 0 };
    },
  });
}

export function usePreOrderItems(preOrderId: string | null) {
  return useQuery({
    queryKey: ['pre-order-items', preOrderId],
    queryFn: async () => {
      if (!preOrderId) return [];
      const { data, error } = await supabase
        .from('b2b_pre_order_items')
        .select('*, product:products(name, unit)')
        .eq('pre_order_id', preOrderId);
      if (error) throw error;
      return data as (B2BPreOrderItem & { product: { name: string; unit: string } })[];
    },
    enabled: !!preOrderId,
  });
}

export function useCreatePreOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...order }: { items: Omit<B2BPreOrderItem, 'id' | 'pre_order_id' | 'created_at' | 'updated_at'>[] } & Omit<B2BPreOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: orderData, error: orderError } = await supabase.from('b2b_pre_orders').insert(order).select().single();
      if (orderError) throw orderError;
      if (items.length > 0) {
        const itemsWithFK = items.map(i => ({ ...i, pre_order_id: orderData.id }));
        const { error: itemsError } = await supabase.from('b2b_pre_order_items').insert(itemsWithFK);
        if (itemsError) throw itemsError;
      }
      return orderData as B2BPreOrder;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['pre-orders'] }),
  });
}

export function useUpdatePreOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('b2b_pre_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['pre-orders'] }),
  });
}

// ============ B2B PURCHASE ORDERS ============

export function usePurchaseOrders(filters: { status?: string; supplier_id?: string; page: number }) {
  const { status, supplier_id, page = 0 } = filters;
  return useQuery({
    queryKey: ['purchase-orders', { status, supplier_id, page }],
    queryFn: async () => {
      let q = supabase.from('b2b_purchase_orders').select('*, supplier:suppliers(name)', { count: 'exact' });
      if (status) q = q.eq('status', status);
      if (supplier_id) q = q.eq('supplier_id', supplier_id);
      q = q.order('order_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as (B2BPurchaseOrder & { supplier: { name: string } })[], total: count ?? 0 };
    },
  });
}

export function usePOItems(poId: string | null) {
  return useQuery({
    queryKey: ['po-items', poId],
    queryFn: async () => {
      if (!poId) return [];
      const { data, error } = await supabase.from('b2b_po_items').select('*, product:products(name, unit)').eq('po_id', poId);
      if (error) throw error;
      return data as (B2BPOItem & { product: { name: string; unit: string } })[];
    },
    enabled: !!poId,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...order }: { items: Omit<B2BPOItem, 'id' | 'po_id' | 'created_at' | 'updated_at' | 'received_qty'>[] } & Omit<B2BPurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: poData, error: poError } = await supabase.from('b2b_purchase_orders').insert(order).select().single();
      if (poError) throw poError;
      if (items.length > 0) {
        const itemsWithFK = items.map(i => ({ ...i, po_id: poData.id, received_qty: '0' }));
        const { error: itemsError } = await supabase.from('b2b_po_items').insert(itemsWithFK);
        if (itemsError) throw itemsError;
      }
      return poData as B2BPurchaseOrder;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useUpdatePOStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('b2b_purchase_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

// ============ B2B RECEIVING ============

export function useReceivingRecords(poId: string | null) {
  return useQuery({
    queryKey: ['receiving-records', poId],
    queryFn: async () => {
      if (!poId) return [];
      const { data, error } = await supabase.from('b2b_receiving_records').select('*, receiver:profiles!received_by(full_name)').eq('po_id', poId).order('receiving_date', { ascending: false });
      if (error) throw error;
      return data as (B2BReceivingRecord & { receiver: { full_name: string } })[];
    },
    enabled: !!poId,
  });
}

export function useCreateReceiving() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...record }: { items: Omit<B2BReceivingItem, 'id' | 'receiving_id' | 'created_at' | 'updated_at'>[] } & Omit<B2BReceivingRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: recData, error: recError } = await supabase.from('b2b_receiving_records').insert(record).select().single();
      if (recError) throw recError;
      if (items.length > 0) {
        const itemsWithFK = items.map(i => ({ ...i, receiving_id: recData.id }));
        const { error: itemsError } = await supabase.from('b2b_receiving_items').insert(itemsWithFK);
        if (itemsError) throw itemsError;
      }
      return recData as B2BReceivingRecord;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['receiving-records'] });
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['po-items'] });
    },
  });
}

// ============ B2B FULFILLMENTS ============

export function useFulfillments(filters: { status?: string; customer_id?: string; page: number }) {
  const { status, customer_id, page = 0 } = filters;
  return useQuery({
    queryKey: ['fulfillments', { status, customer_id, page }],
    queryFn: async () => {
      let q = supabase.from('b2b_fulfillments').select('*, customer:customers(name)', { count: 'exact' });
      if (status) q = q.eq('status', status);
      if (customer_id) q = q.eq('customer_id', customer_id);
      q = q.order('fulfillment_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as (B2BFulfillment & { customer: { name: string } })[], total: count ?? 0 };
    },
  });
}

export function useFulfillmentItems(fulfillmentId: string | null) {
  return useQuery({
    queryKey: ['fulfillment-items', fulfillmentId],
    queryFn: async () => {
      if (!fulfillmentId) return [];
      const { data, error } = await supabase.from('b2b_fulfillment_items').select('*, product:products(name, unit)').eq('fulfillment_id', fulfillmentId);
      if (error) throw error;
      return data as (B2BFulfillmentItem & { product: { name: string; unit: string } })[];
    },
    enabled: !!fulfillmentId,
  });
}

export function useCreateFulfillment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...fulfillment }: { items: Omit<B2BFulfillmentItem, 'id' | 'fulfillment_id' | 'created_at' | 'updated_at'>[] } & Omit<B2BFulfillment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: fData, error: fError } = await supabase.from('b2b_fulfillments').insert(fulfillment).select().single();
      if (fError) throw fError;
      if (items.length > 0) {
        const itemsWithFK = items.map(i => ({ ...i, fulfillment_id: fData.id }));
        const { error: itemsError } = await supabase.from('b2b_fulfillment_items').insert(itemsWithFK);
        if (itemsError) throw itemsError;
      }
      return fData as B2BFulfillment;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['fulfillments'] }),
  });
}

export function useUpdateFulfillmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('b2b_fulfillments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['fulfillments'] });
      qc.invalidateQueries({ queryKey: ['receivables'] });
    },
  });
}
