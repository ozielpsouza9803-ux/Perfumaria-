import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { AuthScreen } from './components/auth/AuthScreen';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { QuickSearch } from './components/common/QuickSearch';
import { Database } from './services/database';

// 10 Official Administrative Modules & Views
import { DashboardView } from './components/views/DashboardView';
import { CadastrosView } from './components/views/CadastrosView';
import { ProdutosModuloView } from './components/views/ProdutosModuloView';
import { EstoqueModuloView } from './components/views/EstoqueModuloView';
import { VendasModuloView } from './components/views/VendasModuloView';
import { FinanceiroModuloView } from './components/views/FinanceiroModuloView';
import { MarketingModuloView } from './components/views/MarketingModuloView';
import { AgendaModuloView } from './components/views/AgendaModuloView';
import { RelatoriosModuloView } from './components/views/RelatoriosModuloView';
import { AdminSecurityView } from './components/views/AdminSecurityView';

// Public Vitrine, Customer Portal & Navigation Components
import { HomeView } from './components/views/HomeView';
import { VitrineView } from './components/views/VitrineView';
import { CustomerPortalView } from './components/views/CustomerPortalView';
import { BottomNav } from './components/common/BottomNav';
import { ConciergeChatModal } from './components/common/ConciergeChatModal';
import { AiGestoraModal } from './components/common/AiGestoraModal';

import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/common/CartDrawer';

// Direct Sub-View Aliases for QuickSearch and Deep-linking
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

const AdminLayout: React.FC = () => {
  const { currentAdmin, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Badge notification counts
  const [badgeCounts, setBadgeCounts] = useState({
    lowStock: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    upcomingAppointments: 0,
  });

  const userRole = currentAdmin?.role || 'CONSULTOR';

  // Guard navigation tabs based on user role permissions
  useEffect(() => {
    if (!isAuthenticated || !currentAdmin) return;
    const ALL_MODULE_TABS: NavTab[] = [
      'home',
      'vitrine',
      'cliente',
      'dashboard',
      'cadastros',
      'produtos',
      'estoque',
      'vendas',
      'financeiro',
      'marketing',
      'agenda',
      'relatorios',
      'seguranca',
      'brands',
      'products',
      'stock',
      'movements',
      'customers',
      'appointments',
      'orders',
      'payments',
      'pix',
      'coupons',
      'reports',
      'settings',
      'security',
    ];
    const rolePermissions: Record<string, NavTab[]> = {
      SUPER_ADMIN: ALL_MODULE_TABS,
      GERENTE: ALL_MODULE_TABS,
      ESTOQUISTA: ALL_MODULE_TABS,
      CONSULTOR: ALL_MODULE_TABS,
    };
    const allowed = rolePermissions[userRole] || ALL_MODULE_TABS;
    if (!allowed.includes(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, userRole, isAuthenticated, currentAdmin]);

  const updateBadges = async () => {
    if (!isAuthenticated) return;
    try {
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
    } catch (err) {
      console.warn('Badges update warning:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    updateBadges();
    const handleDbChange = () => updateBadges();
    const handleOpenSearch = () => setIsQuickSearchOpen(true);

    window.addEventListener('mr_database_change', handleDbChange);
    window.addEventListener('open_quick_search', handleOpenSearch);

    return () => {
      window.removeEventListener('mr_database_change', handleDbChange);
      window.removeEventListener('open_quick_search', handleOpenSearch);
    };
  }, [isAuthenticated]);

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

  // Public tabs accessible to everyone (visitors & clients)
  const isPublicTab = currentTab === 'home' || currentTab === 'vitrine' || currentTab === 'cliente';

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

  // Admin Module Access Guard: strictly verifies authentication and valid administrative role
  const isAdminModule = !isPublicTab;
  const validAdminRoles = ['admin', 'super_admin', 'gerente', 'estoquista', 'consultor'];
  const userRoleNormalized = String(currentAdmin?.role || '').toLowerCase().trim();
  const isAuthorizedAdmin = Boolean(
    isAuthenticated &&
    currentAdmin &&
    currentAdmin.active !== false &&
    validAdminRoles.includes(userRoleNormalized)
  );

  if (!isAuthorizedAdmin && isAdminModule) {
    return (
      <AuthScreen
        onBackToStore={() => setCurrentTab('home')}
        onLoginSuccess={() => setCurrentTab('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive luxury sidebar — ONLY for Admin modules */}
        {isAdminModule && isAuthorizedAdmin && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            badgeCounts={badgeCounts}
            onOpenAi={() => setIsAiModalOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with 3-zone contract — ONLY for Admin modules */}
          {isAdminModule && isAuthorizedAdmin && (
            <TopBar
              currentTab={currentTab}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
              onQuickAction={onQuickAction}
              quickActionLabel={quickActionLabel}
              lowStockCount={badgeCounts.lowStock}
              onNavigate={setCurrentTab}
            />
          )}

          {/* Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
            {/* Public Home, Vitrine & Customer Portal Views */}
            {currentTab === 'home' && (
              <HomeView
                onNavigate={setCurrentTab}
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}
            {currentTab === 'vitrine' && (
              <VitrineView
                onNavigate={setCurrentTab}
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}
            {currentTab === 'cliente' && (
              <CustomerPortalView
                onNavigate={setCurrentTab}
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}

            {/* 10 Official Modules */}
            {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
            {currentTab === 'cadastros' && <CadastrosView />}
            {currentTab === 'produtos' && <ProdutosModuloView />}
            {currentTab === 'estoque' && <EstoqueModuloView onNavigate={setCurrentTab} />}
            {currentTab === 'vendas' && <VendasModuloView />}
            {currentTab === 'financeiro' && <FinanceiroModuloView />}
            {currentTab === 'marketing' && <MarketingModuloView />}
            {currentTab === 'agenda' && <AgendaModuloView />}
            {currentTab === 'relatorios' && <RelatoriosModuloView />}
            {(currentTab === 'seguranca' || currentTab === 'security') && <AdminSecurityView />}

            {/* Direct Navigation Aliases */}
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
          </main>
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar — EXCLUSIVELY on Home screen */}
      {currentTab === 'home' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenChat={() => setIsChatOpen(!isChatOpen)}
        />
      )}

      {/* Floating Concierge Chat Assistant Drawer */}
      <ConciergeChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onToggleOpen={() => setIsChatOpen(!isChatOpen)}
        onNavigate={setCurrentTab}
        currentTab={currentTab}
      />

      {/* Global Shopping Cart Drawer */}
      <CartDrawer onOrderSuccess={() => setCurrentTab('cliente')} />

      {/* Global Command Palette / Quick Search (Cmd+K) */}
      <QuickSearch
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onNavigate={setCurrentTab}
      />

      {/* IA Gestora Central Modal */}
      <AiGestoraModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <AdminLayout />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
