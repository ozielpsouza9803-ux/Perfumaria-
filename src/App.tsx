import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AuthScreen } from './components/auth/AuthScreen';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { QuickSearch } from './components/common/QuickSearch';
import { Database } from './services/database';

// 14 Module Views
import { DashboardView } from './components/views/DashboardView';
import { BrandsView } from './components/views/BrandsView';
import { ProductsView } from './components/views/ProductsView';
import { StockView } from './components/views/StockView';
import { StockMovementsView } from './components/views/StockMovementsView';
import { CustomersView } from './components/views/CustomersView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { OrdersView } from './components/views/OrdersView';
import { PaymentsView } from './components/views/PaymentsView';
import { PixConfigView } from './components/views/PixConfigView';
import { CouponsView } from './components/views/CouponsView';
import { SalesReportsView } from './components/views/SalesReportsView';
import { GeneralSettingsView } from './components/views/GeneralSettingsView';
import { AdminSecurityView } from './components/views/AdminSecurityView';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Badge notification counts
  const [badgeCounts, setBadgeCounts] = useState({
    lowStock: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    upcomingAppointments: 0,
  });

  const updateBadges = async () => {
    const products = await Database.getProducts();
    const orders = await Database.getOrders();
    const payments = await Database.getPaymentReceipts();
    const appointments = await Database.getAppointments();

    const lowStock = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
    const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'Em Separação').length;
    const pendingPayments = payments.filter((p) => p.status === 'Aguardando Análise').length;
    const upcomingAppointments = appointments.filter((a) => a.status === 'Agendado').length;

    setBadgeCounts({
      lowStock,
      pendingOrders,
      pendingPayments,
      upcomingAppointments,
    });
  };

  useEffect(() => {
    updateBadges();
    const handleDbChange = () => updateBadges();
    const handleOpenSearch = () => setIsQuickSearchOpen(true);

    window.addEventListener('mr_database_change', handleDbChange);
    window.addEventListener('open_quick_search', handleOpenSearch);

    return () => {
      window.removeEventListener('mr_database_change', handleDbChange);
      window.removeEventListener('open_quick_search', handleOpenSearch);
    };
  }, []);

  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setLoadingTimeout(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-amber-400">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <span className="font-serif text-sm tracking-widest uppercase block text-white">
              Maison Royale
            </span>
            <span className="text-[10px] tracking-widest uppercase text-amber-500/80 block">
              Iniciando Ateliê Administrativo...
            </span>
          </div>
          
          {loadingTimeout && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <p className="text-[11px] text-zinc-500 mb-3 max-w-xs leading-relaxed">
                A inicialização está levando mais tempo que o esperado. 
                Verifique sua conexão ou as credenciais do Supabase.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-zinc-900 border border-amber-500/30 text-amber-400 text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded-lg"
              >
                Recarregar Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated: show login & admin registration system
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Contextual Quick Action button for TopBar
  let quickActionLabel: string | undefined;
  let onQuickAction: (() => void) | undefined;

  if (currentTab === 'products') {
    quickActionLabel = 'Novo Perfume';
    onQuickAction = () => {
      const event = new CustomEvent('open_create_product');
      window.dispatchEvent(event);
    };
  } else if (currentTab === 'brands') {
    quickActionLabel = 'Nova Marca';
    onQuickAction = () => {
      const event = new CustomEvent('open_create_brand');
      window.dispatchEvent(event);
    };
  } else if (currentTab === 'orders') {
    quickActionLabel = 'Novo Pedido';
  } else if (currentTab === 'customers') {
    quickActionLabel = 'Novo Cliente';
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive luxury sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          badgeCounts={badgeCounts}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with 3-zone contract */}
          <TopBar
            currentTab={currentTab}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
            onQuickAction={onQuickAction}
            quickActionLabel={quickActionLabel}
            lowStockCount={badgeCounts.lowStock}
          />

          {/* Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
            {currentTab === 'brands' && <BrandsView />}
            {currentTab === 'products' && <ProductsView />}
            {currentTab === 'stock' && <StockView onNavigate={setCurrentTab} />}
            {currentTab === 'movements' && <StockMovementsView />}
            {currentTab === 'customers' && <CustomersView />}
            {currentTab === 'appointments' && <AppointmentsView />}
            {currentTab === 'orders' && <OrdersView />}
            {currentTab === 'payments' && <PaymentsView />}
            {currentTab === 'pix' && <PixConfigView />}
            {currentTab === 'coupons' && <CouponsView />}
            {currentTab === 'reports' && <SalesReportsView />}
            {currentTab === 'settings' && <GeneralSettingsView />}
            {currentTab === 'security' && <AdminSecurityView />}
          </main>
        </div>
      </div>

      {/* Global Command Palette / Quick Search (Cmd+K) */}
      <QuickSearch
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onNavigate={setCurrentTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
