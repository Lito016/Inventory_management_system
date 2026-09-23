import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/use-b2b';
import { Pagination } from '@/components/ui/Pagination';
import { PAGE_SIZE } from '@/lib/constants';
import { sanitizeSearchTerm } from '@/lib/inventory';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import type { Product } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

const ACTIVE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Active': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Inactive': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
};

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(0);

  const inventoryTabs = [
    { label: 'Products', to: '/inventory/products' },
    { label: 'Summary', to: '/inventory/summary' },
    { label: 'Adjustments', to: '/inventory/adjustments' },
  ];

  const { data, isLoading, error } = useProducts({ search: sanitizeSearchTerm(search), page });
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { name: '', unit: '', category: '', description: '' },
  });

  const columns: ColumnDef<Product>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'unit', header: 'Unit', render: (r) => r.unit },
    { key: 'category', header: 'Category', render: (r) => r.category || '—' },
    { key: 'is_active', header: 'Status', render: (r) => <Badge status={r.is_active ? 'Active' : 'Inactive'} colorMap={ACTIVE_COLORS} /> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => { setEditProduct(r); reset({ name: r.name, unit: r.unit, category: r.category || '', description: r.description || '' }); }}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => updateProduct.mutate({ id: r.id, is_active: !r.is_active })}>
          {r.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    )},
  ];

  async function onSubmit(data: { name: string; unit: string; category: string; description: string }) {
    setFormError('');
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.id, name: data.name, unit: data.unit, category: data.category || null, description: data.description || null });
      } else {
        await createProduct.mutateAsync({ name: data.name, unit: data.unit, category: data.category || null, description: data.description || null, is_active: true });
      }
      setCreateOpen(false);
      setEditProduct(null);
      reset();
    } catch (err) { setFormError(handleSupabaseError(err)); }
  }

  return (
    <>
      <PageTabs tabs={inventoryTabs} />
      <PageContainer title="Products" actions={<Button onClick={() => { setEditProduct(null); reset(); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1.5" />New Product</Button>}>
      <div className="mb-4 w-full sm:w-64">
        <Input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
      <Table columns={columns} data={data?.items ?? []} loading={isLoading} emptyMessage="No products found." />
      {total > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setPage(Math.max(0, Math.min(p, totalPages - 1)))}
        />
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setEditProduct(null); reset(); }} title={editProduct ? 'Edit Product' : 'New Product'}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => { setCreateOpen(false); setEditProduct(null); }}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>{editProduct ? 'Update' : 'Create'}</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
          <Input label="Product Name *" required {...register('name', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit *" required placeholder="pcs, kg, ream..." {...register('unit', { required: 'Required' })} />
            <Input label="Category" {...register('category')} placeholder="Optional" />
          </div>
          <Input label="Description" {...register('description')} placeholder="Optional" />
        </form>
      </Modal>
    </PageContainer>
    </>
  );
}
