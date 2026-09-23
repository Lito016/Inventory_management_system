import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { usePurchaseOrders, usePOItems, useReceivingRecords, useCreateReceiving } from '@/hooks/use-b2b';
import { useAuth } from '@/hooks/use-auth';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate, getTodayISO } from '@/lib/utils/dates';
import type { ColumnDef } from '@/components/ui/Table';

interface ReceivingRow {
  id: string;
  receiving_date: string;
  po_id: string;
  notes: string | null;
  receiver?: { full_name: string };
}

export function ReceivingPage() {
  const [poFilter, setPoFilter] = useState('');
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const { user } = useAuth();

  const operationsTabs = [
    { label: 'Receiving', to: '/b2b/receiving' },
    { label: 'Fulfillments', to: '/b2b/fulfillments' },
  ];

  const { data: posData } = usePurchaseOrders({ status: 'Submitted', page: 0 });
  const { data: poItems } = usePOItems(poFilter || null);
  const { data: receivingData, isLoading, refetch } = useReceivingRecords(poFilter || null);
  const createReceiving = useCreateReceiving();

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({
    defaultValues: { receiving_date: getTodayISO(), notes: '', items: [] as { po_item_id: string; received_qty: string; variance_qty: string; variance_reason: string }[] },
  });
  useFieldArray({ control, name: 'items' });

  const columns: ColumnDef<ReceivingRow>[] = [
    { key: 'receiving_date', header: 'Date', render: (r) => formatDate(r.receiving_date) },
    { key: 'receiver', header: 'Received By', render: (r) => r.receiver?.full_name || '—' },
    { key: 'notes', header: 'Notes', render: (r) => r.notes || '—' },
  ];

  async function onSubmit(data: { receiving_date: string; notes: string; items: { po_item_id: string; received_qty: string; variance_qty: string; variance_reason: string }[] }) {
    if (!user || !poFilter) return;
    setFormError('');
    try {
      await createReceiving.mutateAsync({
        po_id: poFilter,
        receiving_date: data.receiving_date,
        received_by: user.id,
        notes: data.notes || null,
        items: data.items.filter(i => i.received_qty).map(i => ({
          po_item_id: i.po_item_id,
          received_qty: i.received_qty,
          variance_qty: i.variance_qty || '0',
          variance_reason: i.variance_reason || null,
        })),
      });
      setReceiveOpen(false);
      reset();
      refetch();
    } catch (err) { setFormError(handleSupabaseError(err)); }
  }

  return (
    <>
      <PageTabs tabs={operationsTabs} />
      <PageContainer title="Receiving" actions={poFilter ? <Button onClick={() => setReceiveOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Record Receiving</Button> : undefined}>
      <div className="mb-4 w-full sm:w-64">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order</label>
        <select value={poFilter} onChange={(e) => setPoFilter(e.target.value)} className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm">
          <option value="">Select a PO...</option>
          {posData?.items.map(po => <option key={po.id} value={po.id}>{po.supplier?.name} — {formatDate(po.order_date)}</option>)}
        </select>
      </div>

      {poFilter && (
        <>
          {isLoading ? <div className="text-sm text-gray-500 py-4">Loading...</div> : (
            <>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Receiving History</h3>
              <Table columns={columns} data={(receivingData ?? []) as ReceivingRow[]} loading={isLoading} emptyMessage="No receiving records." />
            </>
          )}
        </>
      )}

      <Modal open={receiveOpen} onClose={() => setReceiveOpen(false)} title="Record Receiving" size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setReceiveOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Record</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
          <Input label="Receiving Date" type="date" required {...register('receiving_date')} />
          <Input label="Notes" {...register('notes')} placeholder="Optional" />

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">Items</label>
            {poItems && poItems.length > 0 ? (
              <table className="w-full">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 py-2">Product</th>
                  <th className="text-right text-xs font-semibold text-gray-500 py-2">Ordered</th>
                  <th className="text-right text-xs font-semibold text-gray-500 py-2">Already Received</th>
                  <th className="text-right text-xs font-semibold text-gray-500 py-2">This Delivery</th>
                  <th className="text-right text-xs font-semibold text-gray-500 py-2">Variance</th>
                </tr></thead>
                <tbody>
                  {poItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 text-sm">{(item as unknown as { product: { name: string } }).product?.name ?? '—'}</td>
                      <td className="py-2 text-sm text-right">{item.ordered_qty}</td>
                      <td className="py-2 text-sm text-right">{item.received_qty}</td>
                      <td className="py-2 text-right"><Input type="number" step="0.01" min="0" placeholder="0" {...register(`items.${idx}.received_qty`)} /></td>
                      <td className="py-2 text-right"><Input type="number" step="0.01" placeholder="0" {...register(`items.${idx}.variance_qty`)} /></td>
                      <input type="hidden" {...register(`items.${idx}.po_item_id`)} value={item.id} />
                      <input type="hidden" {...register(`items.${idx}.variance_reason`)} />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-500 italic">No items in this PO.</p>}
          </div>
        </form>
      </Modal>
    </PageContainer>
    </>
  );
}
