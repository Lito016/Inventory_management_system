import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DemoBanner } from '@/components/layout/DemoBanner';

// Auth pages
import { LoginPage } from '@/routes/_auth/login';
import { ForgotPasswordPage } from '@/routes/_auth/forgot-password';

// Protected pages
import { DashboardPage } from '@/routes/_protected/dashboard';
import { FinanceDashboardPage } from '@/routes/_protected/finance/index';
import { ReceivablesPage } from '@/routes/_protected/finance/receivables';
import { PayablesPage } from '@/routes/_protected/finance/payables';
import { PaymentsPage } from '@/routes/_protected/finance/payments';
import { HistoricalDebtsPage } from '@/routes/_protected/finance/historical-debts';
import { FinanceSearchPage } from '@/routes/_protected/finance/search';
import { PreOrdersPage } from '@/routes/_protected/b2b/pre-orders';
import { PurchaseOrdersPage } from '@/routes/_protected/b2b/purchase-orders';
import { FulfillmentsPage } from '@/routes/_protected/b2b/fulfillments';
import { ReceivingPage } from '@/routes/_protected/b2b/receiving';
import { PrintingOrdersPage } from '@/routes/_protected/b2c/printing-orders';
import { ProductsPage } from '@/routes/_protected/inventory/products';
import { AdjustmentsPage } from '@/routes/_protected/inventory/adjustments';
import { InventorySummaryPage } from '@/routes/_protected/inventory/summary';
import { CustomersPage } from '@/routes/_protected/customers/index';
import { SuppliersPage } from '@/routes/_protected/suppliers/index';
import { ReportsPage } from '@/routes/_protected/reports/index';
import { DocumentsPage } from '@/routes/_protected/documents/index';
import { UsersPage } from '@/routes/_protected/settings/users';

function ProtectedLayout({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ims-sidebar-collapsed') === 'true');

  useEffect(() => { localStorage.setItem('ims-sidebar-collapsed', String(collapsed)); }, [collapsed]);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Esc closes the drawer and returns focus to the menu button.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false); menuBtnRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-canvas">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <Sidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className={`transition-[margin] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
          <DemoBanner />
          <Header onOpenMobile={() => setMobileOpen(true)} menuBtnRef={menuBtnRef} />
          <main className="p-4 sm:p-6">
            {requireAdmin ? <AdminRoute>{children}</AdminRoute> : children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />

            {/* Finance */}
            <Route path="/finance" element={<ProtectedLayout><FinanceDashboardPage /></ProtectedLayout>} />
            <Route path="/finance/receivables" element={<ProtectedLayout><ReceivablesPage /></ProtectedLayout>} />
            <Route path="/finance/payables" element={<ProtectedLayout><PayablesPage /></ProtectedLayout>} />
            <Route path="/finance/payments" element={<ProtectedLayout><PaymentsPage /></ProtectedLayout>} />
            <Route path="/finance/historical-debts" element={<ProtectedLayout><HistoricalDebtsPage /></ProtectedLayout>} />
            <Route path="/finance/search" element={<ProtectedLayout><FinanceSearchPage /></ProtectedLayout>} />

            {/* B2B */}
            <Route path="/b2b/pre-orders" element={<ProtectedLayout><PreOrdersPage /></ProtectedLayout>} />
            <Route path="/b2b/purchase-orders" element={<ProtectedLayout><PurchaseOrdersPage /></ProtectedLayout>} />
            <Route path="/b2b/receiving" element={<ProtectedLayout><ReceivingPage /></ProtectedLayout>} />
            <Route path="/b2b/fulfillments" element={<ProtectedLayout><FulfillmentsPage /></ProtectedLayout>} />

            {/* B2C */}
            <Route path="/b2c/printing-orders" element={<ProtectedLayout><PrintingOrdersPage /></ProtectedLayout>} />

            {/* Inventory */}
            <Route path="/inventory/products" element={<ProtectedLayout><ProductsPage /></ProtectedLayout>} />
            <Route path="/inventory/adjustments" element={<ProtectedLayout><AdjustmentsPage /></ProtectedLayout>} />
            <Route path="/inventory/summary" element={<ProtectedLayout><InventorySummaryPage /></ProtectedLayout>} />

            {/* Directory */}
            <Route path="/customers" element={<ProtectedLayout><CustomersPage /></ProtectedLayout>} />
            <Route path="/suppliers" element={<ProtectedLayout><SuppliersPage /></ProtectedLayout>} />

            {/* Reports & Documents */}
            <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
            <Route path="/documents" element={<ProtectedLayout><DocumentsPage /></ProtectedLayout>} />

            {/* Settings (admin only) */}
            <Route path="/settings/users" element={
              <ProtectedLayout requireAdmin><UsersPage /></ProtectedLayout>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
