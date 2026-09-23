import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { B2CPrintingOrder, B2COrderItem } from '@/types';

export function usePrintingOrders(filters: { status?: string; customer_id?: string; page: number }) {
  const { status, customer_id, page = 0 } = filters;
  return useQuery({
    queryKey: ['printing-orders', { status, customer_id, page }],
    queryFn: async () => {
      let q = supabase.from('b2c_printing_orders').select('*, customer:customers(name)', { count: 'exact' });
      if (status) q = q.eq('status', status);
      if (customer_id) q = q.eq('customer_id', customer_id);
      q = q.order('order_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as (B2CPrintingOrder & { customer: { name: string } })[], total: count ?? 0 };
    },
  });
}

export function usePrintingOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ['printing-order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase.from('b2c_order_items').select('*').eq('order_id', orderId);
      if (error) throw error;
      return data as B2COrderItem[];
    },
    enabled: !!orderId,
  });
}

export function useCreatePrintingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ items, ...order }: {
      items: { description: string; quantity: string; unit_price: string }[];
      customer_id: string;
      order_date: string;
      status: string;
      notes: string | null;
      production_notes: string | null;
      created_by: string;
    }) => {
      const totalAmount = items.reduce((sum, i) => sum + (parseFloat(i.quantity) * parseFloat(i.unit_price)), 0);
      const { data: orderData, error: orderError } = await supabase
        .from('b2c_printing_orders')
        .insert({
          customer_id: order.customer_id,
          order_date: order.order_date,
          status: order.status,
          total_amount: totalAmount.toFixed(2),
          notes: order.notes,
          production_notes: order.production_notes,
          created_by: order.created_by,
        })
        .select().single();
      if (orderError) throw orderError;
      if (items.length > 0) {
        const itemsWithFK = items.map(i => ({
          order_id: orderData.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total: (parseFloat(i.quantity) * parseFloat(i.unit_price)).toFixed(2),
        }));
        const { error: itemsError } = await supabase.from('b2c_order_items').insert(itemsWithFK);
        if (itemsError) throw itemsError;
      }
      return orderData as B2CPrintingOrder;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['printing-orders'] }),
  });
}

export function useUpdatePrintingOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('b2c_printing_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['printing-orders'] });
      qc.invalidateQueries({ queryKey: ['receivables'] });
    },
  });
}

export function useInventoryMovements(filters: { product_id?: string; movement_type?: string; page: number }) {
  const { product_id, movement_type, page = 0 } = filters;
  return useQuery({
    queryKey: ['inventory-movements', { product_id, movement_type, page }],
    queryFn: async () => {
      let q = supabase.from('inventory_movements').select('*, product:products(name, unit)', { count: 'exact' });
      if (product_id) q = q.eq('product_id', product_id);
      if (movement_type) q = q.eq('movement_type', movement_type);
      q = q.order('movement_date', { ascending: false }).range(page * 20, (page + 1) * 20 - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as (InventoryMovementRow & { product: { name: string; unit: string } })[], total: count ?? 0 };
    },
  });
}

export function useCreateInventoryAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<InventoryMovementRow, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('inventory_movements').insert(input).select().single();
      if (error) throw error;
      return data as InventoryMovementRow;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['inventory-movements'] }),
  });
}

interface InventoryMovementRow {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: string;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string;
  movement_date: string;
  created_at: string;
}
