import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTabs } from '@/components/layout/PageTabs';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { sanitizeSearchTerm, stockStatus } from '@/lib/inventory';
import type { ColumnDef } from '@/components/ui/Table';

interface InventorySummaryRow {
  product_id: string;
  name: string;
  category: string | null;
  unit: string;
  total_received: string;
  total_released: string;
  total_adjustments: string;
  current_quantity: string;
}

const STOCK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'In Stock': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Low Stock': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Out of Stock': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const inventoryTabs = [
  { label: 'Products', to: '/inventory/products' },
  { label: 'Summary', to: '/inventory/summary' },
  { label: 'Adjustments', to: '/inventory/adjustments' },
];

export function InventorySummaryPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory-summary', debouncedSearch],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const term = sanitizeSearchTerm(debouncedSearch);
      let q = supabase
        .from('v_inventory_summary')
        .select('product_id, name, category, unit, total_received, total_released, total_adjustments, current_quantity');
      if (term) q = q.or(`name.ilike.%${term}%,category.ilike.%${term}%`);
      q = q.order('name');
      const { data, error } = await q;
      if (error) throw error;
      return data as InventorySummaryRow[];
    },
  });

  const columns: ColumnDef<InventorySummaryRow>[] = [
    { key: 'name', header: 'Product', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'category', header: 'Category', render: (r) => r.category || '—' },
    { key: 'unit', header: 'Unit', render: (r) => r.unit },
    { key: 'total_received', header: 'Total Received', render: (r) => r.total_received },
    { key: 'total_released', header: 'Total Released', render: (r) => r.total_released },
    { key: 'total_adjustments', header: 'Adjustments', render: (r) => {
      const val = Number.parseFloat(r.total_adjustments);
      return <span className={val < 0 ? 'text-red-700' : val > 0 ? 'text-green-700' : ''}>{r.total_adjustments}</span>;
    }},
    { key: 'current_quantity', header: 'Current Stock', render: (r) => {
      const status = stockStatus(Number.parseFloat(r.current_quantity));
      const color = status === 'Out of Stock' ? 'text-red-700' : status === 'Low Stock' ? 'text-amber-700' : 'text-green-700';
      return <span className={`font-semibold ${color}`}>{r.current_quantity}</span>;
    }},
    { key: 'status', header: 'Status', render: (r) => <Badge status={stockStatus(Number.parseFloat(r.current_quantity))} colorMap={STOCK_COLORS} /> },
  ];

  return (
    <>
      <PageTabs tabs={inventoryTabs} />
      <PageContainer title="Inventory Summary">
        <div className="mb-4 w-full sm:w-64">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{handleSupabaseError(error)}</div>}
        <Table columns={columns} data={data ?? []} loading={isLoading} emptyMessage="No inventory data." />
      </PageContainer>
    </>
  );
}
