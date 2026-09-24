import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { usePagination } from '@/hooks/use-pagination';
import { formatDate } from '@/lib/utils/dates';
import type { ColumnDef } from '@/components/ui/Table';

type DocType = 'receivable' | 'payable' | 'pre-order' | 'purchase-order' | 'fulfillment' | 'printing-order';

interface DocRow {
  id: string;
  type: DocType;
  date: string;
  entity_name: string;
  amount: string;
  status: string;
}

const DOC_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Receivable': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Payable': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Pre-Order': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Purchase Order': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Fulfillment': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Printing Order': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const { page } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ['documents', typeFilter, page],
    queryFn: async () => {
      const docs: DocRow[] = [];

      if (!typeFilter || typeFilter === 'receivable') {
        const { data: recs } = await supabase.from('v_receivables').select('id, created_at, customer_name, amount, status').range(page * 20, (page + 1) * 20 - 1);
        if (recs) docs.push(...recs.map(r => ({ id: r.id as string, type: 'receivable' as DocType, date: r.created_at as string, entity_name: r.customer_name as string, amount: r.amount as string, status: r.status as string })));
      }

      if (!typeFilter || typeFilter === 'payable') {
        const { data: pays } = await supabase.from('v_payables').select('id, created_at, supplier_name, amount, status').range(page * 20, (page + 1) * 20 - 1);
        if (pays) docs.push(...pays.map(r => ({ id: r.id as string, type: 'payable' as DocType, date: r.created_at as string, entity_name: r.supplier_name as string, amount: r.amount as string, status: r.status as string })));
      }

      if (!typeFilter || typeFilter === 'pre-order') {
        const { data: pos } = await supabase.from('b2b_pre_orders').select('id, order_date, status, customer:customers!b2b_pre_orders_customer_id_fkey(name)').range(page * 20, (page + 1) * 20 - 1);
        if (pos) docs.push(...pos.map(r => {
          const cust = r.customer as unknown as { name: string } | null;
          return { id: r.id as string, type: 'pre-order' as DocType, date: r.order_date as string, entity_name: cust?.name ?? '—', amount: '0.00', status: r.status as string };
        }));
      }

      if (!typeFilter || typeFilter === 'purchase-order') {
        const { data: pos } = await supabase.from('b2b_purchase_orders').select('id, order_date, status, supplier:suppliers!b2b_purchase_orders_supplier_id_fkey(name)').range(page * 20, (page + 1) * 20 - 1);
        if (pos) docs.push(...pos.map(r => {
          const supp = r.supplier as unknown as { name: string } | null;
          return { id: r.id as string, type: 'purchase-order' as DocType, date: r.order_date as string, entity_name: supp?.name ?? '—', amount: '0.00', status: r.status as string };
        }));
      }

      if (!typeFilter || typeFilter === 'printing-order') {
        const { data: orders } = await supabase.from('b2c_printing_orders').select('id, order_date, status, total_amount, customer:customers!b2c_printing_orders_customer_id_fkey(name)').range(page * 20, (page + 1) * 20 - 1);
        if (orders) docs.push(...orders.map(r => {
          const cust = r.customer as unknown as { name: string } | null;
          return { id: r.id as string, type: 'printing-order' as DocType, date: r.order_date as string, entity_name: cust?.name ?? '—', amount: r.total_amount as string, status: r.status as string };
        }));
      }

      docs.sort((a, b) => b.date.localeCompare(a.date));
      return docs;
    },
  });

  const columns: ColumnDef<DocRow>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'type', header: 'Type', render: (r) => {
      const label = r.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return <Badge status={label} colorMap={DOC_TYPE_COLORS} />;
    }},
    { key: 'entity_name', header: 'Entity', render: (r) => <span className="font-medium">{r.entity_name}</span> },
    { key: 'amount', header: 'Amount', render: (r) => parseFloat(r.amount) > 0 ? `₱${parseFloat(r.amount).toFixed(2)}` : '—' },
    { key: 'status', header: 'Status', render: (r) => r.status },
    { key: 'actions', header: 'Actions', render: () => <Button variant="ghost" size="sm">View</Button> },
  ];

  return (
    <PageContainer title="Documents">
      <div className="mb-4 w-full sm:w-48">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[
          { value: '', label: 'All Documents' },
          { value: 'receivable', label: 'Receivables' },
          { value: 'payable', label: 'Payables' },
          { value: 'pre-order', label: 'Pre-Orders' },
          { value: 'purchase-order', label: 'Purchase Orders' },
          { value: 'printing-order', label: 'Printing Orders' },
        ]} />
      </div>
      <Table columns={columns} data={data ?? []} loading={isLoading} emptyMessage="No documents found." />
    </PageContainer>
  );
}
