import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Users,
  DollarSign,
  ArrowUpRight,
  Boxes,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Database } from '../../services/database';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await Database.getRealMetrics();
      setMetrics(data);
    };
    loadMetrics();
    window.addEventListener('mr_database_change', loadMetrics);
    return () => window.removeEventListener('mr_database_change', loadMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-amber-500/30 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alta Perfumaria Artesanal · Monitoramento em Tempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Maison Royale Parfumerie
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Painel gerencial centralizado com consolidação em tempo real de faturamento, estoque de frascos nobres, clientes VIP e pedidos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ver Pedidos ({metrics.totalOrdersCount})</span>
            </button>
            <button
              onClick={() => onNavigate('stock')}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Inventário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (All computed from real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento Aprovado */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Receita Aprovada</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-mono tabular-nums">
              {formatBRL(metrics.totalRevenue)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">{metrics.approvedOrdersCount} pedido(s)</span>
              <span>liquidados com sucesso</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ticket Médio Real */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Ticket Médio</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-mono tabular-nums">
              {formatBRL(metrics.averageTicket)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Média por pedido de alta perfumaria
            </div>
          </div>
        </div>

        {/* KPI 3: Valor em Estoque (Venda) */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Patrimônio em Frascos</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-mono tabular-nums">
              {formatBRL(metrics.totalInventorySaleValue)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Total de <span className="text-amber-300 font-medium">{metrics.totalStockBottles}</span> frascos nobres no ateliê
            </div>
          </div>
        </div>

        {/* KPI 4: Clientes VIP & Alertas */}
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Clientes VIP</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-white font-mono tabular-nums">
              {metrics.totalCustomers} Clientes
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
              <span className="text-amber-400 font-medium">{metrics.diamondVipCount} Diamond</span>
              <span>·</span>
              <span className="text-amber-300 font-medium">{metrics.goldVipCount} Gold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner (if any) */}
      {metrics.lowStockAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-200 uppercase tracking-wide">
                Atenção ao Estoque Mínimo ({metrics.lowStockAlerts.length} fragrância em nível crítico)
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                {metrics.lowStockAlerts.map((p: any) => `${p.name} (${p.stockQuantity} un)`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Registrar Entrada
          </button>
        </div>
      )}

      {/* Two Column Layout: Real Sales Distribution & Top Fragrances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Payment & Performance Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-white">
                Faturamento por Método de Liquidação
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dados consolidados dos pedidos pagos
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Relatório Completo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real Bar Distribution */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Pix Instantâneo (Taxa Zero)
                </span>
                <span className="font-mono text-zinc-100 font-semibold tabular-nums">
                  {formatBRL(metrics.paymentBreakdown.Pix)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      metrics.totalRevenue > 0
                        ? (metrics.paymentBreakdown.Pix / metrics.totalRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Cartão de Crédito
                </span>
                <span className="font-mono text-zinc-100 font-semibold tabular-nums">
                  {formatBRL(metrics.paymentBreakdown.Cartao)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      metrics.totalRevenue > 0
                        ? (metrics.paymentBreakdown.Cartao / metrics.totalRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Boleto Bancário VIP
                </span>
                <span className="font-mono text-zinc-100 font-semibold tabular-nums">
                  {formatBRL(metrics.paymentBreakdown.Boleto)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      metrics.totalRevenue > 0
                        ? (metrics.paymentBreakdown.Boleto / metrics.totalRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary Bar */}
          <div className="pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-zinc-500 uppercase">Custo Total de Compra</div>
              <div className="text-sm font-semibold text-zinc-300 font-mono tabular-nums mt-0.5">
                {formatBRL(metrics.totalInventoryCostValue)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-zinc-500 uppercase">Margem Potencial Total</div>
              <div className="text-sm font-semibold text-emerald-400 font-mono tabular-nums mt-0.5">
                {formatBRL(metrics.potentialProfit)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-zinc-500 uppercase">Lucro Estimado Bruto</div>
              <div className="text-sm font-semibold text-amber-300 font-mono tabular-nums mt-0.5">
                {metrics.totalInventoryCostValue > 0
                  ? `${Math.round((metrics.potentialProfit / metrics.totalInventoryCostValue) * 100)}%`
                  : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Selling Fragrances */}
        <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-base font-semibold text-white">
                Mais Vendidos
              </h3>
              <span className="text-[11px] text-amber-400/90 font-mono">Ranking Real</span>
            </div>

            <div className="space-y-3 mt-4">
              {metrics.topSellingProducts.length === 0 ? (
                <p className="text-xs text-zinc-500">Nenhum perfume vendido ainda.</p>
              ) : (
                metrics.topSellingProducts.slice(0, 4).map((p: any, idx: number) => (
                  <div
                    key={p.sku}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[11px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-zinc-200 font-medium line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{p.sku}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-300 font-semibold font-mono tabular-nums">
                        {p.unitsSold} frasco(s)
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono tabular-nums">
                        {formatBRL(p.totalGross)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gerenciar Catálogo de Frascos</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-white">
              Últimos Pedidos Recebidos
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atualização automática em tempo real
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            Ver Todos os Pedidos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3 pl-2">Pedido</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Pagamento</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {metrics.recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 pl-2 font-mono text-amber-300 font-medium">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 text-zinc-200">{ord.customerName}</td>
                  <td className="py-3 text-zinc-400 font-mono tabular-nums">
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 text-zinc-300">{ord.paymentMethod}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        ord.paymentStatus === 'Aprovado'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : ord.paymentStatus === 'Pendente'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right font-mono font-semibold text-white tabular-nums">
                    {formatBRL(ord.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
