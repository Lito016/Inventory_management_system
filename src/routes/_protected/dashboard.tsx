import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, Package } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { AmountDisplay } from '@/components/ui/AmountDisplay';
import { useDashboardSummary } from '@/hooks/use-finance';

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  href,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <div className="mt-1">{value}</div>
        </div>
        <div className={`p-2.5 rounded-md ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return content;
}

export function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <PageContainer title="Dashboard">
      {/* Finance Stats */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Finance Overview</h3>
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
              title="Receivables Outstanding"
              value={data ? <AmountDisplay value={data.totalReceivableOutstanding.toString()} className="text-xl font-bold text-gray-900" /> : '—'}
              icon={TrendingUp}
              iconBg="bg-blue-600"
              href="/finance/receivables"
            />
            <StatCard
              title="Payables Outstanding"
              value={data ? <AmountDisplay value={data.totalPayableOutstanding.toString()} className="text-xl font-bold text-gray-900" /> : '—'}
              icon={TrendingDown}
              iconBg="bg-amber-600"
              href="/finance/payables"
            />
            <StatCard
              title="Overdue"
              value={data ? <span className="text-xl font-bold text-red-600">{data.overdueCount}</span> : '—'}
              icon={AlertTriangle}
              iconBg="bg-red-600"
              href="/finance/receivables"
            />
            <StatCard
              title="Net Position"
              value={data ? (
                <AmountDisplay
                  value={(data.totalReceivableOutstanding - data.totalPayableOutstanding).toString()}
                  className="text-xl font-bold text-gray-900"
                />
              ) : '—'}
              icon={DollarSign}
              iconBg="bg-emerald-600"
            />
          </div>
        )}
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ModuleLink href="/customers" label="Customers" icon={Users} color="bg-cyan-600" />
          <ModuleLink href="/suppliers" label="Suppliers" icon={Users} color="bg-slate-600" />
          <ModuleLink href="/inventory/products" label="Products" icon={Package} color="bg-amber-600" />
          <ModuleLink href="/finance" label="Finance" icon={DollarSign} color="bg-blue-600" />
          <ModuleLink href="/b2b/pre-orders" label="B2B Orders" icon={TrendingUp} color="bg-emerald-600" />
          <ModuleLink href="/b2c/printing-orders" label="B2C Printing" icon={TrendingDown} color="bg-violet-600" />
          <ModuleLink href="/reports" label="Reports" icon={Package} color="bg-indigo-600" />
          <ModuleLink href="/documents" label="Documents" icon={Package} color="bg-stone-600" />
        </div>
      </div>
    </PageContainer>
  );
}

function ModuleLink({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-all"
    >
      <div className={`p-2 rounded-md ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </a>
  );
}
