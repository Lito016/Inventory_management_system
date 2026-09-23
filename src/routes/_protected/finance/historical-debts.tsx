import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useHistoricalDebts, useCreateHistoricalDebt, useUpdateDebtStatus } from '@/hooks/use-historical-debts';
import { useAuth } from '@/hooks/use-auth';
import { usePagination } from '@/hooks/use-pagination';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate, getTodayISO } from '@/lib/utils/dates';
import { VERIFICATION_STATUS_COLORS } from '@/lib/constants';
import type { HistoricalDebt } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

export function HistoricalDebtsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const { page } = usePagination();
  const { user } = useAuth();

  const { data, isLoading, error } = useHistoricalDebts({ entity_type: typeFilter || undefined, verification_status: statusFilter || undefined, page });
  const createDebt = useCreateHistoricalDebt();
  const updateStatus = useUpdateDebtStatus();

  const { data: customers } = useQuery({ queryKey: ['customers-select'], queryFn: async () => { const { data } = await supabase.from('customers').select('id, name').eq('is_active', true).order('name'); return data ?? []; } });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers-select'], queryFn: async () => { const { data } = await supabase.from('suppliers').select('id, name').eq('is_active', true).order('name'); return data ?? []; } });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { entity_type: 'customer' as 'customer' | 'supplier', entity_id: '', amount: '', debt_date: getTodayISO(), source: '', description: '' },
  });

  const columns: ColumnDef<HistoricalDebt>[] = [
    { key: 'debt_date', header: 'Date', render: (r) => formatDate(r.debt_date) },
    { key: 'entity_type', header: 'Type', render: (r) => <Badge status={r.entity_type === 'customer' ? 'Customer' : 'Supplier'} colorMap={{ Customer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }, Supplier: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' } }} /> },
    { key: 'amount', header: 'Amount', render: (r) => `₱${parseFloat(r.amount).toFixed(2)}` },
    { key: 'source', header: 'Source', render: (r) => r.source || '—' },
    { key: 'verification_status', header: 'Status', render: (r) => <Badge status={r.verification_status} colorMap={VERIFICATION_STATUS_COLORS} /> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-1">
        {r.verification_status === 'Pending' && <>
          <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: r.id, verification_status: 'Verified' })}>Verify</Button>
          <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: r.id, verification_status: 'Disputed' })}>Dispute</Button>
        </>}
        {r.verification_status === 'Disputed' && <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: r.id, verification_status: 'Adjusted' })}>Adjust</Button>}
      </div>
    )},
  ];

  async function onSubmit(data: { entity_type: 'customer' | 'supplier'; entity_id: string; amount: string; debt_date: string; source: string; description: string }) {
    if (!user) return;
    setFormError('');
    try {
      await createDebt.mutateAsync({
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        amount: data.amount,
        debt_date: data.debt_date,
        source: data.source || null,
        description: data.description || null,
        created_by: user.id,
      });
      setCreateOpen(false);
      reset();
    } catch (err) { setFormError(handleSupabaseError(err)); }
  }

  return (
    <PageContainer title="Historical Debts" actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Record Debt</Button>}>
      <div className="mb-4 flex gap-3">
        <div className="w-full sm:w-40">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{ value: '', label: 'All Types' }, { value: 'customer', label: 'Customers' }, { value: 'supplier', label: 'Suppliers' }]} />
        </div>
        <div className="w-full sm:w-40">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: '', label: 'All Statuses' }, ...['Pending', 'Verified', 'Disputed', 'Adjusted', 'Written Off'].map(s => ({ value: s, label: s }))]} />
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
      <Table columns={columns} data={data?.items ?? []} loading={isLoading} emptyMessage="No historical debts found." />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Record Historical Debt"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Record</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select {...register('entity_type')} className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm">
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
            <Input label="Debt Date" type="date" required {...register('debt_date')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity *</label>
            <select {...register('entity_id', { required: 'Required' })} className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select...</option>
              {(typeFilter !== 'supplier' ? customers : suppliers)?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <Input label="Amount *" type="number" step="0.01" min="0.01" required prefix="₱" {...register('amount', { required: 'Required' })} />
          <Input label="Source" {...register('source')} placeholder="e.g., Legacy system, Manual record" />
          <Input label="Description" {...register('description')} placeholder="Details about this debt" />
        </form>
      </Modal>
    </PageContainer>
  );
}
