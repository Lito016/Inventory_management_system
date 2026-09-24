import { AlertTriangle, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { useDashboardSummary } from '@/hooks/use-finance';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { AlertCircle } from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.08em]">{title}</p>
          <div className="mt-1.5">{value}</div>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="shrink-0 p-2.5 rounded-lg bg-primary-50 text-link">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function FinanceDashboardPage() {
  const { data, isLoading, error } = useDashboardSummary();

  if (error) {
    return (
      <PageContainer title="Finance Dashboard">
        <div className="p-4 bg-error-50 border border-error-500/30 rounded-xl flex items-center gap-2 text-sm text-error-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {handleSupabaseError(error)}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Finance Dashboard">
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
            title="Total Receivables"
            value={data ? <AmountDisplay value={data.totalReceivableOutstanding.toString()} className="text-xl font-semibold text-gray-900" /> : '—'}
            icon={TrendingUp}
            subtitle={data ? `${data.totalReceivables} outstanding` : undefined}
          />
          <StatCard
            title="Total Payables"
            value={data ? <AmountDisplay value={data.totalPayableOutstanding.toString()} className="text-xl font-semibold text-gray-900" /> : '—'}
            icon={TrendingDown}
          />
          <StatCard
            title="Overdue Receivables"
            value={data ? <span className="font-mono text-xl font-semibold text-error-600 tabular-nums">{data.overdueCount}</span> : '—'}
            icon={AlertTriangle}
            subtitle="Requires attention"
          />
          <StatCard
            title="Net Outstanding"
            value={data ? (
              <AmountDisplay
                value={(data.totalReceivableOutstanding - data.totalPayableOutstanding).toString()}
                className="text-xl font-semibold text-gray-900"
              />
            ) : '—'}
            icon={DollarSign}
            subtitle="Receivables − Payables"
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8">
        <h3 className="font-display text-sm font-semibold text-gray-900 mb-3 tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/finance/receivables"
            className="flex items-center gap-3 p-4 bg-surface border border-gray-200 rounded-xl hover:border-primary-400/60 hover:shadow-sm hover:bg-primary-50/40 transition-all"
          >
            <span className="p-2 rounded-lg bg-primary-50 text-link shrink-0"><TrendingUp className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-medium text-gray-900">View Receivables</p>
              <p className="text-xs text-gray-500">Customer outstanding balances</p>
            </div>
          </a>
          <a
            href="/finance/payables"
            className="flex items-center gap-3 p-4 bg-surface border border-gray-200 rounded-xl hover:border-primary-400/60 hover:shadow-sm hover:bg-primary-50/40 transition-all"
          >
            <span className="p-2 rounded-lg bg-primary-50 text-link shrink-0"><TrendingDown className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-medium text-gray-900">View Payables</p>
              <p className="text-xs text-gray-500">Supplier outstanding balances</p>
            </div>
          </a>
          <a
            href="/finance/payments"
            className="flex items-center gap-3 p-4 bg-surface border border-gray-200 rounded-xl hover:border-primary-400/60 hover:shadow-sm hover:bg-primary-50/40 transition-all"
          >
            <span className="p-2 rounded-lg bg-primary-50 text-link shrink-0"><Clock className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-medium text-gray-900">Record Payment</p>
              <p className="text-xs text-gray-500">Log a new payment transaction</p>
            </div>
          </a>
        </div>
      </div>
    </PageContainer>
  );
}
