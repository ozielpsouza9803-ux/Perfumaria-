import React from 'react';
import {
  LayoutDashboard,
  Award,
  Package,
  Boxes,
  ArrowLeftRight,
  Users,
  CalendarCheck,
  ShoppingBag,
  Receipt,
  QrCode,
  Tag,
  BarChart3,
  Sliders,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'cadastros'
  | 'produtos'
  | 'estoque'
  | 'vendas'
  | 'financeiro'
  | 'marketing'
  | 'agenda'
  | 'relatorios'
  | 'seguranca'
  // Portal & Vitrine routes
  | 'home'
  | 'vitrine'
  | 'cliente'
  // Backward-compatible sub-routes
  | 'brands'
  | 'products'
  | 'stock'
  | 'movements'
  | 'customers'
  | 'appointments'
  | 'orders'
  | 'payments'
  | 'pix'
  | 'coupons'
  | 'reports'
  | 'settings'
  | 'security';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  badgeCounts: {
    lowStock: number;
    pendingOrders: number;
    pendingPayments: number;
    upcomingAppointments: number;
  };
}

interface MenuItem {
  id: NavTab;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  badge?: number;
  badgeType?: 'alert' | 'info';
  category: 'VISÃO GERAL' | 'CADASTROS & CATÁLOGO' | 'OPERAÇÃO & VENDAS' | 'FINANÇAS & SEGURANÇA';
  allowedRoles?: AdminRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  badgeCounts,
}) => {
  const { currentAdmin, logout } = useAuth();
  const userRole: AdminRole = currentAdmin?.role || 'CONSULTOR';

  const ALL_ROLES: AdminRole[] = ['SUPER_ADMIN', 'GERENTE', 'ESTOQUISTA', 'CONSULTOR'];

  const menuItems: MenuItem[] = [
    // 1. Dashboard
    {
      id: 'dashboard',
      label: '1. Dashboard',
      subLabel: 'Visão geral da perfumaria',
      icon: LayoutDashboard,
      category: 'VISÃO GERAL',
      allowedRoles: ALL_ROLES,
    },
    // 2. Cadastros
    {
      id: 'cadastros',
      label: '2. Cadastros',
      subLabel: 'Clientes, Fornecedores, Equipe',
      icon: Users,
      category: 'CADASTROS & CATÁLOGO',
      allowedRoles: ALL_ROLES,
    },
    // 3. Produtos
    {
      id: 'produtos',
      label: '3. Produtos',
      subLabel: 'Perfumes, Marcas, Fragrâncias',
      icon: Package,
      category: 'CADASTROS & CATÁLOGO',
      allowedRoles: ALL_ROLES,
    },
    // 4. Estoque
    {
      id: 'estoque',
      label: '4. Estoque',
      subLabel: 'Posição, Entradas & Saídas',
      icon: Boxes,
      badge: badgeCounts.lowStock,
      badgeType: 'alert',
      category: 'OPERAÇÃO & VENDAS',
      allowedRoles: ALL_ROLES,
    },
    // 5. Vendas
    {
      id: 'vendas',
      label: '5. Vendas',
      subLabel: 'Nova Venda PDV & Pedidos',
      icon: ShoppingBag,
      badge: badgeCounts.pendingOrders,
      badgeType: 'info',
      category: 'OPERAÇÃO & VENDAS',
      allowedRoles: ALL_ROLES,
    },
    // 6. Financeiro
    {
      id: 'financeiro',
      label: '6. Financeiro',
      subLabel: 'Fluxo Caixa, Pagar & Receber',
      icon: DollarSign,
      badge: badgeCounts.pendingPayments,
      badgeType: 'alert',
      category: 'FINANÇAS & SEGURANÇA',
      allowedRoles: ALL_ROLES,
    },
    // 7. Marketing
    {
      id: 'marketing',
      label: '7. Marketing',
      subLabel: 'Cupons, Promoções & VIP',
      icon: Sparkles,
      category: 'OPERAÇÃO & VENDAS',
      allowedRoles: ALL_ROLES,
    },
    // 8. Agenda
    {
      id: 'agenda',
      label: '8. Agenda',
      subLabel: 'Consultorias Olfativas VIP',
      icon: CalendarCheck,
      badge: badgeCounts.upcomingAppointments,
      category: 'OPERAÇÃO & VENDAS',
      allowedRoles: ALL_ROLES,
    },
    // 9. Relatórios
    {
      id: 'relatorios',
      label: '9. Relatórios',
      subLabel: 'Vendas, Estoque, DRE',
      icon: BarChart3,
      category: 'FINANÇAS & SEGURANÇA',
      allowedRoles: ALL_ROLES,
    },
    // 10. Perfil e Segurança
    {
      id: 'seguranca',
      label: '10. Perfil & Segurança',
      subLabel: 'Meu Perfil, 4 Níveis RBAC',
      icon: ShieldAlert,
      category: 'FINANÇAS & SEGURANÇA',
      allowedRoles: ALL_ROLES,
    },
  ];

  const visibleMenuItems = menuItems;

  const handleItemClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop with click outside to close */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 bg-zinc-950 border-r border-amber-500/20 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="block font-serif text-sm font-bold text-white tracking-wider truncate">
                  MAISON ROYALE
                </span>
                <span className="block text-[10px] text-amber-400/90 font-medium tracking-widest truncate">
                  PAINEL ADM HAUTE
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 rounded-lg transition-colors"
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-300'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left tracking-wide">
                    {item.label}
                  </span>
                )}

                {/* Badge notifications */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`shrink-0 px-1.5 py-0.5 text-[10px] font-mono rounded font-semibold ${
                      item.badgeType === 'alert'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-l" />
                )}
              </button>
            );
          })}
        </div>

        {/* Return to Public Home & User profile */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 space-y-2">
          {currentTab !== 'home' && (
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Voltar à Tela Inicial Pública sem encerrar a sessão"
            >
              <Home className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Voltar ao Início</span>}
            </button>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {currentAdmin?.name.charAt(0) || 'A'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-zinc-200 truncate">{currentAdmin?.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{currentAdmin?.role}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              title="Encerrar sessão com segurança"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
