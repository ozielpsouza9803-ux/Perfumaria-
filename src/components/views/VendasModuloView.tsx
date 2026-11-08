import React, { useState } from 'react';
import {
  ShoppingBag,
  CreditCard,
  Receipt,
  FileCheck,
  Plus,
} from 'lucide-react';
import { OrdersView } from './OrdersView';

export type VendasSubTab = 'pedidos' | 'nova_venda';

interface VendasModuloViewProps {
  initialSubTab?: VendasSubTab;
}

export const VendasModuloView: React.FC<VendasModuloViewProps> = ({
  initialSubTab = 'pedidos',
}) => {
  const [activeTab, setActiveTab] = useState<VendasSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Módulo 5: Gestão de Vendas & Pedidos
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Emissão de vendas balcão (PDV), acompanhamento de pedidos VIP, status de faturamento e despacho de frascos.
        </p>
      </div>

      {/* OrdersView incorporates full order listing, POS creation and details */}
      <OrdersView />
    </div>
  );
};
