import { useState } from 'react';
import { AlertCircle, Eye, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate } from '@/lib/utils/dates';
import { FINANCE_STATUS_COLORS, PAGE_SIZE } from '@/lib/constants';
import type { VPayable, Payment } from '@/types';
import type { ColumnDef } from '@/components/ui/Table';

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Outstanding', label: 'Outstanding' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Fully Paid', label: 'Fully Paid' },
  { value: 'Voided', label: 'Voided' },
];

function usePayables(filters: { search?: string; status?: string; page: number; pageSize?: number }) {
  const { search = '', status, page = 0, pageSize = 20 } = filters;
  return useQuery({
    queryKey: ['payables', { search, status, page, pageSize }],
    queryFn: async () => {
      let q = supabase.from('v_payables').select('*', { count: 'exact' });
      if (search) q = q.or(`supplier_name.ilike.%${search}%,notes.ilike.%${search}%`);
      if (status) q = q.eq('status', status);
      q = q.order('due_date', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { items: data as VPayable[], total: count ?? 0 };
    },
  });
}

function usePayablePayments(payableId: string | null) {
  return useQuery({
    queryKey: ['payments', 'payable', payableId],
    queryFn: async () => {
      if (!payableId) return [];
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('source_id', payableId)
        .eq('payment_type', 'payable')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!payableId,
  });
}

export function PayablesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayable, setSelectedPayable] = useState<VPayable | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { page, resetPage } = usePagination();

  const financeTabs = [
    { label: 'Receivables', to: '/finance/receivables' },
    { label: 'Payables', to: '/finance/payables' },
    { label: 'Payments', to: '/finance/payments' },
  ];

  const { data, isLoading, error } = usePayables({
    search,
    status: statusFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const columns: ColumnDef<VPayable>[] = [
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (row) => <span className="font-medium text-gray-900">{row.supplier_name}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <AmountDisplay value={row.amount} />,
    },
    {
      key: 'outstanding_balance',
      header: 'Balance',
      render: (row) => <AmountDisplay value={row.outstanding_balance} />,
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (row) => (
        <span className={row.is_overdue ? 'text-red-600 font-medium flex items-center gap-1' : ''}>
          {row.is_overdue && <AlertTriangle className="h-3.5 w-3.5" />}
          {formatDate(row.due_date)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          status={row.is_overdue ? 'Overdue' : row.status}
          colorMap={FINANCE_STATUS_COLORS}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPayable(row);
            setDetailOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <>
      <PageTabs tabs={financeTabs} />
      <PageContainer title="Payables">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            placeholder="Search by supplier name..."
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            options={statusFilterOptions}
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
        emptyMessage="No payables found."
        rowClassName={(row) => row.is_overdue ? 'bg-red-50/50' : ''}
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

      {selectedPayable && (
        <PayableDetailModal
          payable={selectedPayable}
          open={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedPayable(null); }}
        />
      )}
    </PageContainer>
    </>
  );
}

function PayableDetailModal({
  payable,
  open,
  onClose,
}: {
  payable: VPayable;
  open: boolean;
  onClose: () => void;
}) {
  const { data: payments, isLoading } = usePayablePayments(open ? payable.id : null);

  return (
    <Modal open={open} onClose={onClose} title="Payable Detail" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Supplier</p>
            <p className="text-sm font-medium text-gray-900">{payable.supplier_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
            <AmountDisplay value={payable.amount} className="text-sm font-medium" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</p>
            <AmountDisplay value={payable.outstanding_balance} className="text-sm font-medium text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
            <p className={`text-sm font-medium ${payable.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(payable.due_date)} {payable.is_overdue && '(Overdue)'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <Badge status={payable.is_overdue ? 'Overdue' : payable.status} colorMap={FINANCE_STATUS_COLORS} />
          </div>
        </div>

        {payable.notes && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{payable.notes}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment History</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Date</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Method</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Reference</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Amount</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className={`border-b border-gray-100 ${p.is_voided ? 'bg-gray-50 opacity-60' : ''}`}>
                      <td className="px-3 py-2 text-sm">{formatDate(p.payment_date)}</td>
                      <td className="px-3 py-2 text-sm">{p.payment_method}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{p.reference_number || '—'}</td>
                      <td className="px-3 py-2 text-sm text-right font-medium"><AmountDisplay value={p.amount} /></td>
                      <td className="px-3 py-2 text-sm text-center">
                        {p.is_voided ? <span className="text-xs text-gray-500">Voided</span> : <span className="text-xs text-green-600">Active</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No payments recorded yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
