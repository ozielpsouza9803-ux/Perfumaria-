import React, { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
} from 'lucide-react';
import { StockView } from './StockView';
import { StockMovementsView } from './StockMovementsView';
import { NavTab } from '../common/Sidebar';

export type EstoqueSubTab = 'posicao' | 'movimentacoes';

interface EstoqueModuloViewProps {
  initialSubTab?: EstoqueSubTab;
  onNavigate?: (tab: NavTab) => void;
}

export const EstoqueModuloView: React.FC<EstoqueModuloViewProps> = ({
  initialSubTab = 'posicao',
  onNavigate = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<EstoqueSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Módulo 4: Controle de Estoque & Movimentações
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Inventário patrimonial, controle de frascos em boutique, entradas com NF-e, saídas e rastreamento de lotes.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('posicao')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'posicao'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Posição do Estoque Atual & Alertas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movimentacoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'movimentacoes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Entradas, Saídas & Histórico</span>
        </button>
      </div>

      {activeTab === 'posicao' && <StockView onNavigate={onNavigate} />}
      {activeTab === 'movimentacoes' && <StockMovementsView />}
    </div>
  );
};
