import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { formatDate, getTodayISO } from '@/lib/utils/dates';

type ReportType = 'sales' | 'receivables' | 'payables' | 'inventory' | 'payments' | 'customer-transactions' | 'supplier-transactions';

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(getTodayISO());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', reportType, dateFrom, dateTo],
    queryFn: async () => {
      switch (reportType) {
        case 'sales': {
          let q = supabase.from('b2c_printing_orders').select('order_date, status, total_amount').eq('status', 'Paid');
          if (dateFrom) q = q.gte('order_date', dateFrom);
          if (dateTo) q = q.lte('order_date', dateTo);
          q = q.order('order_date', { ascending: false });
          const { data } = await q;
          return (data ?? []).map(r => ({ order_date: r.order_date, status: r.status, total_amount: r.total_amount }));
        }
        case 'receivables': {
          const { data } = await supabase.from('v_receivables').select('notes, customer_name, amount, outstanding_balance, status, due_date');
          return (data ?? []).map(r => ({ description: r.notes, customer_name: r.customer_name, amount: r.amount, outstanding_balance: r.outstanding_balance, status: r.status, due_date: r.due_date }));
        }
        case 'payables': {
          const { data } = await supabase.from('v_payables').select('notes, supplier_name, amount, outstanding_balance, status, due_date');
          return (data ?? []).map(r => ({ description: r.notes, supplier_name: r.supplier_name, amount: r.amount, outstanding_balance: r.outstanding_balance, status: r.status, due_date: r.due_date }));
        }
        case 'payments': {
          let q = supabase.from('payments').select('payment_date, payment_type, amount, method, reference_number');
          if (dateFrom) q = q.gte('payment_date', dateFrom);
          if (dateTo) q = q.lte('payment_date', dateTo);
          q = q.order('payment_date', { ascending: false });
          const { data } = await q;
          return (data ?? []).map(r => ({ payment_date: r.payment_date, payment_type: r.payment_type, amount: r.amount, method: r.method, reference_number: r.reference_number }));
        }
        case 'inventory': {
          const { data } = await supabase.from('v_inventory_summary').select('name, category, unit, total_received, total_released, total_adjustments, current_quantity');
          return (data ?? []).map(r => ({ product_name: r.name, category: r.category, unit: r.unit, total_received: r.total_received, total_released: r.total_released, total_adjustments: r.total_adjustments, current_stock: r.current_quantity }));
        }
        case 'customer-transactions': {
          const { data } = await supabase.from('v_customer_outstanding').select('customer_name, total_outstanding');
          return (data ?? []).map(r => ({ customer_name: r.customer_name, total_outstanding: r.total_outstanding }));
        }
        case 'supplier-transactions': {
          const { data } = await supabase.from('v_supplier_outstanding').select('supplier_name, total_outstanding');
          return (data ?? []).map(r => ({ supplier_name: r.supplier_name, total_outstanding: r.total_outstanding }));
        }
        default: return [];
      }
    },
  });

  function exportCSV() {
    if (!reportData?.length) return;
    const headers = Object.keys(reportData[0] as Record<string, unknown>);
    const csv = [headers.join(','), ...reportData.map(row => headers.map(h => `"${(row as Record<string, unknown>)[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${getTodayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = reportData?.length ? Object.keys(reportData[0] as Record<string, unknown>) : [];

  return (
    <PageContainer title="Reports" actions={<Button variant="secondary" onClick={exportCSV} disabled={!reportData?.length}>Export CSV</Button>}>
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="w-full sm:w-48">
          <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} options={[
            { value: 'sales', label: 'Sales Report' },
            { value: 'receivables', label: 'Receivables Report' },
            { value: 'payables', label: 'Payables Report' },
            { value: 'payments', label: 'Payments Report' },
            { value: 'inventory', label: 'Inventory Report' },
            { value: 'customer-transactions', label: 'Customer Summary' },
            { value: 'supplier-transactions', label: 'Supplier Summary' },
          ]} />
        </div>
        <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading report...</div>
      ) : reportData && reportData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map(col => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 py-2 px-3">{col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  {columns.map(col => {
                    const val = (row as Record<string, unknown>)[col];
                    return (
                      <td key={col} className="py-2 px-3 text-sm">
                        {typeof val === 'number' ? `₱${val.toFixed(2)}` : typeof val === 'string' && val.startsWith('20') ? formatDate(val) : (val?.toString() || '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-gray-500 py-8 text-center">No data for the selected period.</div>
      )}
    </PageContainer>
  );
}
