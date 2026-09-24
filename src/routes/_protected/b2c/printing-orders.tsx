import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { usePrintingOrders, usePrintingOrderItems, useCreatePrintingOrder, useUpdatePrintingOrderStatus } from '@/hooks/use-b2c';
import { useAuth } from '@/hooks/use-auth';
import { usePagination } from '@/hooks/use-pagination';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate, getTodayISO } from '@/lib/utils/dates';
import { PRINTING_ORDER_STATUS_COLORS } from '@/lib/constants';
import type { B2CPrintingOrder } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

export function PrintingOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const { page } = usePagination();
  const { user } = useAuth();

  const ordersTabs = [
    { label: 'Pre-Orders', to: '/b2b/pre-orders' },
    { label: 'Purchase Orders', to: '/b2b/purchase-orders' },
    { label: 'Printing Orders', to: '/b2c/printing-orders' },
  ];

  const { data, isLoading, error } = usePrintingOrders({ status: statusFilter || undefined, page });
  const { data: detailItems } = usePrintingOrderItems(detailId);
  const createOrder = useCreatePrintingOrder();
  const updateStatus = useUpdatePrintingOrderStatus();

  const { data: customers } = useQuery({ queryKey: ['customers-select'], queryFn: async () => { const { data } = await supabase.from('customers').select('id, name').eq('is_active', true).order('name'); return data ?? []; } });

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({
    defaultValues: { customer_id: '', order_date: getTodayISO(), notes: '', production_notes: '', items: [{ description: '', quantity: '1', unit_price: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const columns: ColumnDef<B2CPrintingOrder & { customer: { name: string } }>[] = [
    { key: 'order_date', header: 'Date', render: (r) => formatDate(r.order_date) },
    { key: 'customer', header: 'Customer', render: (r) => <span className="font-medium">{r.customer?.name}</span> },
    { key: 'total_amount', header: 'Total', render: (r) => `₱${parseFloat(r.total_amount).toFixed(2)}` },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} colorMap={PRINTING_ORDER_STATUS_COLORS} /> },
    { key: 'actions', header: 'Actions', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'Pending' && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'In Production' }); }}>Start</Button>}
        {r.status === 'In Production' && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'Completed' }); }}>Complete</Button>}
        {r.status === 'Completed' && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'Released' }); }}>Release</Button>}
        {r.status === 'Released' && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'Paid' }); }}>Mark Paid</Button>}
        {(r.status === 'Pending' || r.status === 'In Production') && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: r.id, status: 'Cancelled' }); }}>Cancel</Button>}
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetailId(r.id); }}>Items</Button>
      </div>
    )},
  ];

  async function onSubmit(data: { customer_id: string; order_date: string; notes: string; production_notes: string; items: { description: string; quantity: string; unit_price: string }[] }) {
    if (!user) return;
    setFormError('');
    try {
      await createOrder.mutateAsync({
        customer_id: data.customer_id,
        order_date: data.order_date,
        status: 'Pending',
        notes: data.notes || null,
        production_notes: data.production_notes || null,
        created_by: user.id,
        items: data.items.map(i => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price })),
      });
      setCreateOpen(false);
      reset();
    } catch (err) { setFormError(handleSupabaseError(err)); }
  }

  return (
    <>
      <PageTabs tabs={ordersTabs} />
      <PageContainer title="Printing Orders" actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New Order</Button>}>
      <div className="mb-4 w-full sm:w-44">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: '', label: 'All Statuses' }, ...['Pending', 'In Production', 'Completed', 'Released', 'Paid', 'Cancelled'].map(s => ({ value: s, label: s }))]} />
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
      <Table columns={columns} data={data?.items ?? []} loading={isLoading} emptyMessage="No printing orders found." />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Printing Order" size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select {...register('customer_id', { required: 'Required' })} className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500">
                <option value="">Select customer...</option>
                {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Order Date" type="date" required {...register('order_date')} />
          </div>
          <Input label="Notes" {...register('notes')} placeholder="Customer notes" />
          <Input label="Production Notes" {...register('production_notes')} placeholder="Internal production notes" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Items</label>
              <Button type="button" variant="secondary" size="sm" onClick={() => append({ description: '', quantity: '1', unit_price: '' })}>
                <Plus className="h-3.5 w-3.5 mr-1" />Add Item
              </Button>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <Input placeholder="Description" {...register(`items.${idx}.description`, { required: true })} />
                </div>
                <Input type="number" step="0.01" min="1" placeholder="Qty" {...register(`items.${idx}.quantity`, { required: true })} />
                <Input type="number" step="0.01" min="0.01" placeholder="Price" prefix="₱" {...register(`items.${idx}.unit_price`, { required: true })} />
                {fields.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>✕</Button>}
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* Items Detail Modal */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Order Items" size="md">
        {detailItems && detailItems.length > 0 ? (
          <table className="w-full">
            <thead><tr className="border-b border-gray-200"><th className="text-left text-xs font-semibold text-gray-500 py-2">Description</th><th className="text-right text-xs font-semibold text-gray-500 py-2">Qty</th><th className="text-right text-xs font-semibold text-gray-500 py-2">Price</th><th className="text-right text-xs font-semibold text-gray-500 py-2">Total</th></tr></thead>
            <tbody>
              {detailItems.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 text-sm">{item.description}</td>
                  <td className="py-2 text-sm text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-right">₱{item.unit_price}</td>
                  <td className="py-2 text-sm text-right font-medium">₱{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-500 italic">No items.</p>}
      </Modal>
    </PageContainer>
    </>
  );
}
