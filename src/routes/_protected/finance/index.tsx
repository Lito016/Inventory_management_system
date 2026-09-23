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
  iconColor,
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <div className="mt-1">{value}</div>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-md ${iconColor}`}>
          <Icon className="h-5 w-5 text-white" />
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
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
            <div key={i} className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Receivables"
            value={data ? <AmountDisplay value={data.totalReceivableOutstanding.toString()} className="text-xl font-bold text-gray-900" /> : '—'}
            icon={TrendingUp}
            iconColor="bg-blue-600"
            subtitle={data ? `${data.totalReceivables} outstanding` : undefined}
          />
          <StatCard
            title="Total Payables"
            value={data ? <AmountDisplay value={data.totalPayableOutstanding.toString()} className="text-xl font-bold text-gray-900" /> : '—'}
            icon={TrendingDown}
            iconColor="bg-amber-600"
          />
          <StatCard
            title="Overdue Receivables"
            value={data ? <span className="text-xl font-bold text-red-600">{data.overdueCount}</span> : '—'}
            icon={AlertTriangle}
            iconColor="bg-red-600"
            subtitle="Requires attention"
          />
          <StatCard
            title="Net Outstanding"
            value={data ? (
              <AmountDisplay
                value={(data.totalReceivableOutstanding - data.totalPayableOutstanding).toString()}
                className="text-xl font-bold text-gray-900"
              />
            ) : '—'}
            icon={DollarSign}
            iconColor="bg-emerald-600"
            subtitle="Receivables − Payables"
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/finance/receivables"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">View Receivables</p>
              <p className="text-xs text-gray-500">Customer outstanding balances</p>
            </div>
          </a>
          <a
            href="/finance/payables"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <TrendingDown className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">View Payables</p>
              <p className="text-xs text-gray-500">Supplier outstanding balances</p>
            </div>
          </a>
          <a
            href="/finance/payments"
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <Clock className="h-5 w-5 text-emerald-600" />
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
