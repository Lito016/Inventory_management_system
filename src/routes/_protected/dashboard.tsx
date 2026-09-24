import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, Package, ArrowDownRight, ArrowUpRight, Truck, Printer, FileBarChart, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { Badge } from '@/components/ui/Badge';
import { useDashboardSummary } from '@/hooks/use-finance';
import { useInventoryMovements } from '@/hooks/use-b2c';
import { supabase } from '@/lib/supabase/client';
import { stockStatus, movementQuantityDisplay } from '@/lib/inventory';
import { formatDate } from '@/lib/utils/dates';

interface SummaryRow {
  product_id: string;
  name: string;
  unit: string;
  current_quantity: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = (
    <div className="bg-surface border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.08em]">{title}</p>
          <div className="mt-1.5">{value}</div>
        </div>
        <div className="shrink-0 p-2.5 rounded-lg bg-primary-50 text-link">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

export function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  const { data: stockRows, isLoading: stockLoading, isError: stockError } = useQuery({
    queryKey: ['dashboard-low-stock'],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('v_inventory_summary')
        .select('product_id, name, unit, current_quantity')
        .order('current_quantity', { ascending: true });
      if (error) throw error;
      return (rows as SummaryRow[]) ?? [];
    },
  });
  const needsAttention = (stockRows ?? [])
    .filter((r) => stockStatus(parseFloat(r.current_quantity)) !== 'In Stock')
    .slice(0, 5);

  const { data: movements, isLoading: movementsLoading, isError: movementsError } = useInventoryMovements({ page: 0 });
  const recentActivity = (movements?.items ?? []).slice(0, 5);

  return (
    <PageContainer title="Dashboard">
      {/* Finance Stats */}
      <div className="mb-8">
        <h2 className="font-display text-sm font-semibold text-gray-900 mb-3 tracking-tight">Finance Overview</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Receivables Outstanding"
              value={data ? <AmountDisplay value={data.totalReceivableOutstanding.toString()} className="text-xl font-semibold text-gray-900" /> : '—'}
              icon={TrendingUp}
              href="/finance/receivables"
            />
            <StatCard
              title="Payables Outstanding"
              value={data ? <AmountDisplay value={data.totalPayableOutstanding.toString()} className="text-xl font-semibold text-gray-900" /> : '—'}
              icon={TrendingDown}
              href="/finance/payables"
            />
            <StatCard
              title="Overdue"
              value={data ? <span className="font-mono text-xl font-semibold text-error-600 tabular-nums">{data.overdueCount}</span> : '—'}
              icon={AlertTriangle}
              href="/finance/receivables"
            />
            <StatCard
              title="Net Position"
              value={data ? (
                <AmountDisplay
                  value={(data.totalReceivableOutstanding - data.totalPayableOutstanding).toString()}
                  className="text-xl font-semibold text-gray-900"
                />
              ) : '—'}
              icon={DollarSign}
            />
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="font-display text-sm font-semibold text-gray-900 mb-3 tracking-tight">Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ModuleLink href="/customers" label="Customers" icon={Users} />
          <ModuleLink href="/suppliers" label="Suppliers" icon={Truck} />
          <ModuleLink href="/inventory/products" label="Products" icon={Package} />
          <ModuleLink href="/finance" label="Finance" icon={DollarSign} />
          <ModuleLink href="/b2b/pre-orders" label="B2B Orders" icon={TrendingUp} />
          <ModuleLink href="/b2c/printing-orders" label="B2C Printing" icon={Printer} />
          <ModuleLink href="/reports" label="Reports" icon={FileBarChart} />
          <ModuleLink href="/documents" label="Documents" icon={FolderOpen} />
        </div>
      </div>

      {/* Needs Attention + Recent Activity */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-sm font-semibold text-gray-900 mb-3 tracking-tight">Needs Attention</h2>
          <div className="bg-surface border border-gray-200 rounded-xl overflow-hidden">
            {stockLoading ? (
              <ul className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </li>
                ))}
              </ul>
            ) : stockError ? (
              <p className="px-4 py-6 text-sm text-error-700 text-center">Could not load stock levels.</p>
            ) : needsAttention.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">All products are sufficiently stocked.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {needsAttention.map((r) => {
                  const status = stockStatus(parseFloat(r.current_quantity));
                  return (
                    <li key={r.product_id} className="px-4 py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                        <p className="text-xs text-gray-500">{parseFloat(r.current_quantity).toLocaleString()} {r.unit}</p>
                      </div>
                      <Badge status={status} colorMap={STOCK_COLORS} />
                    </li>
                  );
                })}
              </ul>
            )}
            <Link to="/inventory/summary" className="block px-4 py-2.5 text-xs font-medium text-link hover:text-link-hover hover:bg-gray-50 border-t border-gray-100 rounded-b-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              View inventory →
            </Link>
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold text-gray-900 mb-3 tracking-tight">Recent Activity</h2>
          <div className="bg-surface border border-gray-200 rounded-xl overflow-hidden">
            {movementsLoading ? (
              <ul className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                    <div className="flex-1"><div className="h-4 w-40 bg-gray-100 rounded animate-pulse" /></div>
                  </li>
                ))}
              </ul>
            ) : movementsError ? (
              <p className="px-4 py-6 text-sm text-error-700 text-center">Could not load recent movements.</p>
            ) : recentActivity.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No stock movements recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentActivity.map((m) => {
                  const display = movementQuantityDisplay(m.movement_type, m.quantity);
                  const positive = display.startsWith('+');
                  const product = m.product?.name ?? '—';
                  return (
                    <li key={m.id} className="px-4 py-3 flex items-center gap-3">
                      <span className={`p-1.5 rounded-full shrink-0 ${positive ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                        {positive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{product}</p>
                        <p className="text-xs text-gray-500 capitalize">{m.movement_type} · {formatDate(m.movement_date)}</p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-success-700' : 'text-error-700'}`}>
                        {display}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link to="/inventory/adjustments" className="block px-4 py-2.5 text-xs font-medium text-link hover:text-link-hover hover:bg-gray-50 border-t border-gray-100 rounded-b-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              View all movements →
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

const STOCK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'In Stock': { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-500/30' },
  'Low Stock': { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-500/30' },
  'Out of Stock': { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-500/30' },
};

function ModuleLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 p-4 bg-surface border border-gray-200 rounded-xl hover:border-primary-400/60 hover:shadow-sm hover:bg-primary-50/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="p-2 rounded-lg bg-primary-50 text-link group-hover:bg-primary-600 group-hover:text-on-accent transition-colors duration-200">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  );
}
