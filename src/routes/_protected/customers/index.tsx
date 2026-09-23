import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { usePagination } from '@/hooks/use-pagination';
import { customerSchema, type CustomerFormData } from '@/lib/utils/validators';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { PAGE_SIZE } from '@/lib/constants';
import type { Customer } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'Both', label: 'Both' },
];

const typeBadgeColors: Record<string, string> = {
  'B2B': 'bg-blue-50 text-blue-700 border-blue-200',
  'B2C': 'bg-violet-50 text-violet-700 border-violet-200',
  'Both': 'bg-gray-100 text-gray-600 border-gray-200',
};

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formError, setFormError] = useState('');

  const { page, resetPage } = usePagination();

  const { data, isLoading, error } = useCustomers({
    search,
    type: typeFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      type: 'Both',
    },
  });

  const columns: ColumnDef<Customer>[] = [
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
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border ${typeBadgeColors[row.type] || ''}`}>
          {row.type}
        </span>
      ),
    },
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
    setEditingCustomer(null);
    setFormError('');
    reset({ name: '', contact_person: '', phone: '', email: '', address: '', type: 'Both' });
    setModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);
    setFormError('');
    reset({
      name: customer.name,
      contact_person: customer.contact_person || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      type: customer.type,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: CustomerFormData) {
    setFormError('');
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, ...data });
      } else {
        await createCustomer.mutateAsync({
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
      title="Customers"
      actions={
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Customer
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            placeholder="Search customers..."
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
            options={typeOptions}
          />
        </div>
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
        emptyMessage="No customers found. Add your first customer to get started."
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
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
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
            placeholder="Customer name"
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

          <Select
            label="Type"
            {...register('type')}
            options={[
              { value: 'B2B', label: 'B2B' },
              { value: 'B2C', label: 'B2C' },
              { value: 'Both', label: 'Both' },
            ]}
            error={errors.type?.message}
          />
        </form>
      </Modal>
    </PageContainer>
  );
}
