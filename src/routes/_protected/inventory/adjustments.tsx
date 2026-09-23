import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useInventoryMovements, useCreateInventoryAdjustment } from '@/hooks/use-b2c';
import { useAuth } from '@/hooks/use-auth';
import { PAGE_SIZE } from '@/lib/constants';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate, getTodayISO } from '@/lib/utils/dates';
import { movementQuantityDisplay, parseAdjustmentQuantity, projectedQuantityAfterAdjustment } from '@/lib/inventory';
import type { ColumnDef } from '@/components/ui/Table';

const MOVEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  received: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  released: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  adjustment: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const inventoryTabs = [
  { label: 'Products', to: '/inventory/products' },
  { label: 'Summary', to: '/inventory/summary' },
  { label: 'Adjustments', to: '/inventory/adjustments' },
];

interface MovementRow {
  id: string;
  movement_date: string;
  movement_type: string;
  quantity: string;
  notes: string | null;
  product: { name: string; unit: string };
}

interface AdjustmentForm {
  product_id: string;
  quantity: string;
  reason: string;
  movement_date: string;
}

export function AdjustmentsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [negativeConfirm, setNegativeConfirm] = useState<{ values: AdjustmentForm; quantity: number; productName: string } | null>(null);
  const { user } = useAuth();

  const { data: movementData, isLoading, error } = useInventoryMovements({ movement_type: typeFilter || undefined, page });
  const total = movementData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const createAdjustment = useCreateInventoryAdjustment();

  const { register, handleSubmit, watch, reset, formState: { isSubmitting, errors } } = useForm<AdjustmentForm>({
    defaultValues: { product_id: '', quantity: '', reason: '', movement_date: getTodayISO() },
  });
  const selectedProductId = watch('product_id');

  const { data: products } = useQuery({
    queryKey: ['products-select'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, name, unit').eq('is_active', true).order('name');
      return data ?? [];
    },
  });

  const { data: stock } = useQuery({
    queryKey: ['product-stock', selectedProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_inventory_summary')
        .select('name, current_quantity')
        .eq('product_id', selectedProductId)
        .single();
      if (error) throw error;
      return data as { name: string; current_quantity: string };
    },
    enabled: !!selectedProductId,
  });

  async function saveAdjustment(values: AdjustmentForm, quantity: number) {
    if (!user) return;
    try {
      await createAdjustment.mutateAsync({
        product_id: values.product_id,
        movement_type: 'adjustment',
        quantity: String(quantity),
        notes: values.reason,
        reference_type: 'adjustment',
        reference_id: null,
        created_by: user.id,
        movement_date: values.movement_date,
      });
      setCreateOpen(false);
      setNegativeConfirm(null);
      reset({ product_id: '', quantity: '', reason: '', movement_date: getTodayISO() });
    } catch (err) {
      setNegativeConfirm(null);
      setFormError(handleSupabaseError(err));
    }
  }

  async function onSubmit(values: AdjustmentForm) {
    if (!user) return;
    setFormError('');
    const quantity = parseAdjustmentQuantity(values.quantity);
    if (quantity === null) {
      setFormError('Quantity must be a non-zero number — positive to increase stock, negative to decrease.');
      return;
    }
    if (quantity < 0) {
      if (!stock) {
        setFormError('Could not load current stock for this product. Try again.');
        return;
      }
      if (projectedQuantityAfterAdjustment(stock.current_quantity, quantity) < 0) {
        setNegativeConfirm({ values, quantity, productName: stock.name });
        return;
      }
    }
    await saveAdjustment(values, quantity);
  }

  const columns: ColumnDef<MovementRow>[] = [
    { key: 'movement_date', header: 'Date', render: (r) => formatDate(r.movement_date) },
    { key: 'product', header: 'Product', render: (r) => <span className="font-medium">{r.product?.name}</span> },
    { key: 'movement_type', header: 'Type', render: (r) => <Badge status={r.movement_type} colorMap={MOVEMENT_COLORS} /> },
    { key: 'quantity', header: 'Quantity', render: (r) => {
      const display = movementQuantityDisplay(r.movement_type, r.quantity);
      const value = Number.parseFloat(r.quantity);
      return <span className={r.movement_type === 'adjustment' && value < 0 ? 'text-red-700' : ''}>{display}</span>;
    }},
    { key: 'notes', header: 'Reason / Notes', render: (r) => r.notes || '—' },
  ];

  const productOptions = (products ?? []).map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` }));

  return (
    <>
      <PageTabs tabs={inventoryTabs} />
      <PageContainer title="Inventory Adjustments" actions={<Button onClick={() => { setFormError(''); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1.5" />New Adjustment</Button>}>
        <div className="mb-4 w-full sm:w-44">
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }} options={[{ value: '', label: 'All Types' }, { value: 'received', label: 'Received' }, { value: 'released', label: 'Released' }, { value: 'adjustment', label: 'Adjustment' }]} aria-label="Filter by movement type" />
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
        <Table columns={columns} data={movementData?.items ?? []} loading={isLoading} emptyMessage="No inventory movements found." />
        {total > PAGE_SIZE && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => setPage(Math.max(0, Math.min(p, totalPages - 1)))}
          />
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Inventory Adjustment"
          footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create</Button></div>}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
            <Select label="Product *" required placeholder="Select product..." options={productOptions} error={errors.product_id?.message} {...register('product_id', { required: 'Product is required' })} />
            {stock && (
              <p className="text-xs text-gray-500 -mt-2">
                Current stock: <span className="font-medium text-gray-700">{stock.current_quantity}</span>
              </p>
            )}
            <Input label="Date *" type="date" required {...register('movement_date', { required: 'Date is required' })} />
            <Input label="Quantity *" type="number" step="0.01" required placeholder="Positive to increase, negative to decrease"
              {...register('quantity', {
                required: 'Quantity is required',
                validate: (v) => parseAdjustmentQuantity(v) !== null || 'Enter a non-zero number',
              })} />
            <Input label="Reason *" placeholder="Why is this adjustment needed?" maxLength={500}
              {...register('reason', {
                required: 'Reason is required',
                maxLength: { value: 500, message: 'Reason must be at most 500 characters' },
              })} />
          </form>
        </Modal>

        <ConfirmDialog
          open={!!negativeConfirm}
          title="Negative Stock Warning"
          message={negativeConfirm ? `This adjustment will result in negative stock for ${negativeConfirm.productName}. Continue?` : ''}
          confirmLabel="Adjust Anyway"
          variant="primary"
          loading={createAdjustment.isPending}
          onCancel={() => setNegativeConfirm(null)}
          onConfirm={() => { if (negativeConfirm) void saveAdjustment(negativeConfirm.values, negativeConfirm.quantity); }}
        />
      </PageContainer>
    </>
  );
}
