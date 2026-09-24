import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePagination } from '@/hooks/use-pagination';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate } from '@/lib/utils/dates';
import { FINANCE_STATUS_COLORS } from '@/lib/constants';
import { sanitizeSearchTerm } from '@/lib/inventory';
import type { ColumnDef } from '@/components/ui/Table';

interface TransactionRow {
  id: string;
  type: 'Receivable' | 'Payable';
  date: string;
  entity: string;
  description: string;
  amount: string;
  outstanding: string;
  status: string;
}

export function FinanceSearchPage() {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');
  const [search, setSearch] = useState(qParam ?? '');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { page } = usePagination();

  // Sync when a header search navigates here with a new ?q (keyed on the value,
  // so same-route re-navigation with an unchanged q does not clobber edits).
  useEffect(() => {
    setSearch(qParam ?? '');
  }, [qParam]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['finance-search', search, typeFilter, statusFilter, page],
    queryFn: async () => {
      const rows: TransactionRow[] = [];
      const term = sanitizeSearchTerm(search);

      if (!typeFilter || typeFilter === 'receivable') {
        let q = supabase.from('v_receivables').select('id, created_at, customer_name, notes, amount, outstanding_balance, status');
        if (statusFilter) q = q.eq('status', statusFilter);
        if (term) q = q.or(`customer_name.ilike.%${term}%,notes.ilike.%${term}%`);
        const { data: recs } = await q.order('created_at', { ascending: false });
        if (recs) rows.push(...recs.map(r => ({
          id: r.id as string, type: 'Receivable' as const, date: r.created_at as string,
          entity: r.customer_name as string, description: (r.notes as string) || '',
          amount: r.amount as string, outstanding: r.outstanding_balance as string, status: r.status as string,
        })));
      }

      if (!typeFilter || typeFilter === 'payable') {
        let q = supabase.from('v_payables').select('id, created_at, supplier_name, notes, amount, outstanding_balance, status');
        if (statusFilter) q = q.eq('status', statusFilter);
        if (term) q = q.or(`supplier_name.ilike.%${term}%,notes.ilike.%${term}%`);
        const { data: pays } = await q.order('created_at', { ascending: false });
        if (pays) rows.push(...pays.map(r => ({
          id: r.id as string, type: 'Payable' as const, date: r.created_at as string,
          entity: r.supplier_name as string, description: (r.notes as string) || '',
          amount: r.amount as string, outstanding: r.outstanding_balance as string, status: r.status as string,
        })));
      }

      rows.sort((a, b) => b.date.localeCompare(a.date));
      return rows;
    },
  });

  const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Receivable: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Payable: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const columns: ColumnDef<TransactionRow>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'type', header: 'Type', render: (r) => <Badge status={r.type} colorMap={TYPE_COLORS} /> },
    { key: 'entity', header: 'Entity', render: (r) => <span className="font-medium">{r.entity}</span> },
    { key: 'description', header: 'Description', render: (r) => r.description || '—' },
    { key: 'amount', header: 'Amount', render: (r) => `₱${parseFloat(r.amount).toFixed(2)}` },
    { key: 'outstanding', header: 'Outstanding', render: (r) => {
      const val = parseFloat(r.outstanding);
      return <span className={val > 0 ? 'font-semibold text-red-600' : ''}>₱{val.toFixed(2)}</span>;
    }},
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} colorMap={FINANCE_STATUS_COLORS} /> },
  ];

  return (
    <PageContainer title="Finance Search & History">
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search by entity or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-full sm:w-36">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[
            { value: '', label: 'All Types' },
            { value: 'receivable', label: 'Receivables' },
            { value: 'payable', label: 'Payables' },
          ]} />
        </div>
        <div className="w-full sm:w-36">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
            { value: '', label: 'All Statuses' },
            ...['Outstanding', 'Partially Paid', 'Fully Paid', 'Voided'].map(s => ({ value: s, label: s })),
          ]} />
        </div>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
      <Table columns={columns} data={data ?? []} loading={isLoading} emptyMessage="No transactions found." />
    </PageContainer>
  );
}
