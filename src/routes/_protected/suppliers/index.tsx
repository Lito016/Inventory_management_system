import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from '@/hooks/use-suppliers';
import { usePagination } from '@/hooks/use-pagination';
import { supplierSchema, type SupplierFormData } from '@/lib/utils/validators';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { PAGE_SIZE } from '@/lib/constants';
import type { Supplier } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

export function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formError, setFormError] = useState('');

  const { page, resetPage } = usePagination();

  const { data, isLoading, error } = useSuppliers({
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const columns: ColumnDef<Supplier>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{row.name}</span>
          {!row.is_active && (
            <span className="ml-2 text-xs text-gray-400">(Inactive)</span>
          )}
        </div>
      ),
    },
    { key: 'contact_person', header: 'Contact Person' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'address', header: 'Address' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(row);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  function openCreateModal() {
    setEditingSupplier(null);
    setFormError('');
    reset({ name: '', contact_person: '', phone: '', email: '', address: '' });
    setModalOpen(true);
  }

  function openEditModal(supplier: Supplier) {
    setEditingSupplier(supplier);
    setFormError('');
    reset({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setModalOpen(true);
  }

  async function onSubmit(data: SupplierFormData) {
    setFormError('');
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, ...data });
      } else {
        await createSupplier.mutateAsync({
          ...data,
          contact_person: data.contact_person || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          is_active: true,
        });
      }
      setModalOpen(false);
      reset();
    } catch (err) {
      setFormError(handleSupabaseError(err));
    }
  }

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <PageContainer
      title="Suppliers"
      actions={
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Supplier
        </Button>
      }
    >
      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); resetPage(); }}
          placeholder="Search suppliers..."
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {handleSupabaseError(error)}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        emptyMessage="No suppliers found. Add your first supplier to get started."
        onRowClick={(row) => openEditModal(row)}
      />

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={data.total}
          pageSize={PAGE_SIZE}
          onPageChange={() => {}}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setFormError(''); }}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => { setModalOpen(false); setFormError(''); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
            >
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {formError}
            </div>
          )}

          <Input
            label="Name"
            required
            {...register('name')}
            error={errors.name?.message}
            placeholder="Supplier name"
          />

          <Input
            label="Contact Person"
            {...register('contact_person')}
            error={errors.contact_person?.message}
            placeholder="Primary contact name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="Phone number"
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Email address"
            />
          </div>

          <Input
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Physical address"
          />
        </form>
      </Modal>
    </PageContainer>
  );
}
