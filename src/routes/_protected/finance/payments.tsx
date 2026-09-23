import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { useRecordPayment } from '@/hooks/use-finance';
import { useAuth } from '@/hooks/use-auth';
import { usePagination } from '@/hooks/use-pagination';
import { paymentSchema, type PaymentFormData } from '@/lib/utils/validators';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate, getTodayISO } from '@/lib/utils/dates';
import { PAGE_SIZE } from '@/lib/constants';
import type { Payment } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Check', label: 'Check' },
];

function usePayments(filters: { search?: string; payment_type?: string; page: number; pageSize?: number }) {
  const { search = '', payment_type, page = 0, pageSize = 20 } = filters;
  return useQuery({
    queryKey: ['payments', 'list', { search, payment_type, page, pageSize }],
    queryFn: async () => {
      let q = supabase.from('payments').select('*', { count: 'exact' });
      if (search) q = q.or(`reference_number.ilike.%${search}%`);
      if (payment_type) q = q.eq('payment_type', payment_type);
      q = q.order('payment_date', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as Payment[], total: count ?? 0 };
    },
  });
}

export function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const { page, resetPage } = usePagination();
  const { user } = useAuth();

  const financeTabs = [
    { label: 'Receivables', to: '/finance/receivables' },
    { label: 'Payables', to: '/finance/payables' },
    { label: 'Payments', to: '/finance/payments' },
  ];

  const { data, isLoading, error } = usePayments({
    search,
    payment_type: typeFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const recordPayment = useRecordPayment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_type: 'receivable',
      payment_method: 'Cash',
      payment_date: getTodayISO(),
      amount: '',
      reference_number: '',
    },
  });

  const columns: ColumnDef<Payment>[] = [
    {
      key: 'payment_date',
      header: 'Date',
      render: (row) => formatDate(row.payment_date),
    },
    {
      key: 'payment_type',
      header: 'Type',
      render: (row) => (
        <Badge
          status={row.payment_type === 'receivable' ? 'Receivable' : 'Payable'}
          colorMap={{
            Receivable: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            Payable: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
          }}
        />
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <AmountDisplay value={row.amount} />,
    },
    {
      key: 'payment_method',
      header: 'Method',
    },
    {
      key: 'reference_number',
      header: 'Reference',
      render: (row) => row.reference_number || '—',
    },
    {
      key: 'is_voided',
      header: 'Status',
      render: (row) => row.is_voided
        ? <span className="text-xs text-red-600 font-medium">Voided</span>
        : <span className="text-xs text-green-600 font-medium">Active</span>,
    },
  ];

  async function onSubmit(data: PaymentFormData) {
    if (!user) return;
    setFormError('');
    try {
      await recordPayment.mutateAsync({
        payment_type: data.payment_type as 'receivable' | 'payable',
        source_id: data.source_id,
        amount: data.amount,
        payment_date: data.payment_date,
        payment_method: data.payment_method as 'Cash' | 'Bank Transfer' | 'Check',
        reference_number: data.reference_number || null,
        recorded_by: user.id,
      });
      setModalOpen(false);
      reset();
    } catch (err) {
      setFormError(handleSupabaseError(err));
    }
  }

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <>
      <PageTabs tabs={financeTabs} />
      <PageContainer
        title="Payments"
      actions={
        <Button onClick={() => { setFormError(''); reset(); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Record Payment
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            placeholder="Search by reference number..."
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
            options={[
              { value: '', label: 'All Types' },
              { value: 'receivable', label: 'Receivable' },
              { value: 'payable', label: 'Payable' },
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {handleSupabaseError(error)}
        </div>
      )}

      <Table
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        emptyMessage="No payments recorded yet."
        rowClassName={(row) => row.is_voided ? 'opacity-50' : ''}
      />

      {data && data.total > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={data.total}
          pageSize={PAGE_SIZE}
          onPageChange={() => {}}
        />
      )}

      {/* Record Payment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setFormError(''); }}
        title="Record Payment"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setModalOpen(false); setFormError(''); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              Record Payment
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

          <Select
            label="Payment Type"
            {...register('payment_type')}
            options={[
              { value: 'receivable', label: 'Receivable (Customer)' },
              { value: 'payable', label: 'Payable (Supplier)' },
            ]}
            error={errors.payment_type?.message}
          />

          <Input
            label="Source ID"
            required
            {...register('source_id')}
            error={errors.source_id?.message}
            placeholder="Receivable or Payable UUID"
          />

          <Input
            label="Amount"
            required
            prefix="₱"
            type="number"
            step="0.01"
            {...register('amount')}
            error={errors.amount?.message}
            placeholder="0.00"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payment Date"
              required
              type="date"
              {...register('payment_date')}
              error={errors.payment_date?.message}
            />
            <Select
              label="Payment Method"
              {...register('payment_method')}
              options={paymentMethodOptions}
              error={errors.payment_method?.message}
            />
          </div>

          <Input
            label="Reference Number"
            {...register('reference_number')}
            error={errors.reference_number?.message}
            placeholder="Check number or reference"
          />
        </form>
      </Modal>
    </PageContainer>
    </>
  );
}
