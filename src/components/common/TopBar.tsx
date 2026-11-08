import React from 'react';
import { Menu, Search, Plus, Bell, Shield, ExternalLink, Lock, UserCheck, Home, ArrowLeft } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onOpenQuickSearch: () => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  lowStockCount: number;
  onNavigate?: (tab: NavTab) => void;
}

const TAB_TITLES: Record<NavTab, { title: string; category: string }> = {
  dashboard: { title: '1. Dashboard Geral', category: 'Visão Geral' },
  cadastros: { title: '2. Cadastros Centrais', category: 'Cadastros' },
  produtos: { title: '3. Fragrâncias & Marcas', category: 'Catálogo' },
  estoque: { title: '4. Estoque & Movimentações', category: 'Estoque' },
  vendas: { title: '5. Vendas & Pedidos', category: 'Vendas' },
  financeiro: { title: '6. Finanças & Tesouraria', category: 'Financeiro' },
  marketing: { title: '7. Marketing & VIP', category: 'Marketing' },
  agenda: { title: '8. Agenda & Consultorias', category: 'Atendimento' },
  relatorios: { title: '9. Relatórios Analíticos', category: 'Inteligência' },
  seguranca: { title: '10. Perfil & Segurança', category: 'Segurança' },
  home: { title: 'Maison Royale — Vitrine Principal', category: 'Ateliê' },
  vitrine: { title: 'Vitrine do Acervo Olfativo', category: 'Catálogo' },
  cliente: { title: 'Portal VIP do Cliente', category: 'Relacionamento' },
  // Backward compatibility aliases
  brands: { title: 'Gestão de Marcas', category: 'Catálogo' },
  products: { title: 'Cadastro e Gestão de Produtos', category: 'Catálogo' },
  stock: { title: 'Controle de Estoque & Alertas', category: 'Estoque' },
  movements: { title: 'Entrada e Saída de Mercadorias', category: 'Estoque' },
  customers: { title: 'Gestão de Clientes VIP', category: 'Relacionamento' },
  appointments: { title: 'Agenda de Atendimento e Consultoria', category: 'Atendimento' },
  orders: { title: 'Gestão de Pedidos', category: 'Vendas' },
  payments: { title: 'Pagamentos e Comprovantes', category: 'Financeiro' },
  pix: { title: 'Configuração do Pix & QR Code', category: 'Financeiro' },
  coupons: { title: 'Cupons e Campanhas Promocionais', category: 'Marketing' },
  reports: { title: 'Relatórios de Vendas e Lucro', category: 'Financeiro' },
  settings: { title: 'Configurações Gerais da Loja', category: 'Sistema' },
  security: { title: 'Perfil e Segurança do Administrador', category: 'Segurança' },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenQuickSearch,
  onQuickAction,
  quickActionLabel,
  lowStockCount,
  onNavigate,
}) => {
  const { isAuthenticated, currentAdmin } = useAuth();
  const currentInfo = TAB_TITLES[currentTab] || { title: 'Painel ADM', category: 'Geral' };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Breadcrumbs & Mobile trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 rounded-lg transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-zinc-500 hidden sm:inline whitespace-nowrap">{currentInfo.category}</span>
          <span className="text-zinc-700 hidden sm:inline">/</span>
          <h1 className="font-serif text-sm sm:text-base font-semibold text-zinc-100 tracking-wide truncate">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Search trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenQuickSearch}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Pesquisar produtos, pedidos, marcas...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenQuickSearch}
          className="md:hidden p-2 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 rounded-lg transition-colors"
          title="Pesquisar"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: Primary Action / Quick Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onNavigate && currentTab !== 'home' && (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Retornar à Tela Inicial Pública mantendo a sessão"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Voltar à Tela Inicial</span>
          </button>
        )}

        {isAuthenticated && currentAdmin && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentAdmin.role}</span>
          </div>
        )}

        {lowStockCount > 0 && (
          <div
            title={`${lowStockCount} perfume(s) com estoque crítico`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{lowStockCount} Alerta(s) Estoque</span>
          </div>
        )}

        {onQuickAction && quickActionLabel && (
          <button
            type="button"
            onClick={onQuickAction}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{quickActionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};
