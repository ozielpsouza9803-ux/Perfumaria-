import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Boxes,
  PieChart,
  Award,
} from 'lucide-react';
import { Database } from '../../services/database';
import { Order, Product, Customer } from '../../types';
import { useToast } from '../common/Toast';

export type RelatoriosSubTab = 'vendas' | 'produtos' | 'estoque' | 'clientes' | 'financeiro';

interface RelatoriosModuloViewProps {
  initialSubTab?: RelatoriosSubTab;
}

export const RelatoriosModuloView: React.FC<RelatoriosModuloViewProps> = ({
  initialSubTab = 'vendas',
}) => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<RelatoriosSubTab>(initialSubTab);

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [o, p, c, cf] = await Promise.all([
          Database.getOrders(),
          Database.getProducts(),
          Database.getCustomers(),
          Database.getCashFlowSummary(),
        ]);
        setOrders(o);
        setProducts(p);
        setCustomers(c);
        setCashFlow(cf);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const approvedOrders = orders.filter((o) => o.paymentStatus === 'Aprovado');
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  // Top products
  const productSalesMap = new Map<
    string,
    { name: string; sku: string; units: number; revenue: number }
  >();
  approvedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prev = productSalesMap.get(item.productId) || {
        name: item.productName,
        sku: item.sku,
        units: 0,
        revenue: 0,
      };
      prev.units += item.quantity;
      prev.revenue += item.totalPrice;
      productSalesMap.set(item.productId, prev);
    });
  });
  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  // Stock values
  const totalBottles = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalCost = products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0);
  const totalRetail = products.reduce((sum, p) => sum + p.stockQuantity * p.salePrice, 0);
  const potentialProfit = totalRetail - totalCost;

  // Top clients
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6">
      {/* Header and Print action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Módulo 9: Relatórios Analíticos & Inteligência
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Demonstrativos de vendas, curva ABC de fragrâncias, patrimônio de estoque, LTV de clientes VIP e DRE.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.print();
            success('Relatório enviado para impressão / PDF!');
          }}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Exportar Relatório / Imprimir</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('vendas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'vendas'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>1. Relatório de Vendas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('produtos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'produtos'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Produtos Mais Vendidos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('estoque')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'estoque'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>3. Relatório de Estoque</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clientes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'clientes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Relatório de Clientes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'financeiro'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Relatório Financeiro</span>
        </button>
      </div>

      {/* TAB 1: RELATÓRIO DE VENDAS */}
      {activeTab === 'vendas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Faturamento Bruto</span>
              <div className="text-2xl font-serif font-bold text-amber-300 font-mono">
                R$ {totalRevenue.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500">Pedidos com pagamento confirmado</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Total de Pedidos Aprovados</span>
              <div className="text-2xl font-serif font-bold text-white font-mono">
                {approvedOrders.length}
              </div>
              <span className="text-[10px] text-zinc-500">Volume consolidado</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Tíquete Médio de Venda</span>
              <div className="text-2xl font-serif font-bold text-emerald-300 font-mono">
                R$ {averageTicket.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500">Valor médio por transação VIP</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white">Últimas Vendas Aprovadas</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-2">Nº Pedido</th>
                    <th className="pb-2">Cliente VIP</th>
                    <th className="pb-2">Forma de Pagto</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {approvedOrders.slice(0, 8).map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-800/40">
                      <td className="py-2.5 font-mono text-amber-400">{o.orderNumber}</td>
                      <td className="py-2.5 text-zinc-200 font-medium">{o.customerName}</td>
                      <td className="py-2.5 text-zinc-400">{o.paymentMethod}</td>
                      <td className="py-2.5 text-right font-mono text-amber-300 font-bold">
                        R$ {o.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right text-zinc-500 font-mono">
                        {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUTOS MAIS VENDIDOS */}
      {activeTab === 'produtos' && (
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h4 className="font-serif text-sm font-semibold text-white">
            Ranking de Fragrâncias por Faturamento & Unidades
          </h4>

          {topProducts.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              Nenhuma venda registrada até o momento para gerar o ranking.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-xs border border-amber-500/30">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-serif font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">SKU: {p.sku}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Frascos Vendidos</span>
                      <span className="font-mono text-zinc-200 font-semibold">{p.units} un</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Receita Bruta</span>
                      <span className="font-mono text-amber-300 font-bold">
                        R$ {p.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RELATÓRIO DE ESTOQUE */}
      {activeTab === 'estoque' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Total de Frascos em Boutique</span>
              <div className="text-2xl font-serif font-bold text-white font-mono">
                {totalBottles} unidades
              </div>
              <span className="text-[10px] text-zinc-500">Inventário ativo</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Custo Patrimonial do Estoque</span>
              <div className="text-2xl font-serif font-bold text-zinc-300 font-mono">
                R$ {totalCost.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500">Preço de compra das casas olfativas</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Potencial de Faturamento</span>
              <div className="text-2xl font-serif font-bold text-amber-300 font-mono">
                R$ {totalRetail.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                Lucro Projetado: R$ {potentialProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RELATÓRIO DE CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h4 className="font-serif text-sm font-semibold text-white">
            Clientes Mais Rentáveis (LTV & Frequência de Compra)
          </h4>

          <div className="space-y-2.5">
            {topCustomers.slice(0, 10).map((c, i) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {c.city}/{c.state} · {c.vipTier}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">LTV Acumulado</span>
                  <span className="font-mono text-amber-300 font-bold">
                    R$ {c.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RELATÓRIO FINANCEIRO (DRE) */}
      {activeTab === 'financeiro' && cashFlow && (
        <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <h4 className="font-serif text-sm font-semibold text-white">
            DRE Gerencial Simplificado — Maison Royale Haute Parfumerie
          </h4>

          <div className="space-y-3 text-xs divide-y divide-zinc-800">
            <div className="flex justify-between pt-2">
              <span className="text-zinc-300 font-medium">1. Receita Operacional Bruta (Vendas de Perfumes)</span>
              <span className="font-mono font-bold text-emerald-400">
                + R$ {cashFlow.orderIncome.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <span className="text-zinc-300 font-medium">2. Outras Receitas Operacionais (Recebíveis Liquidados)</span>
              <span className="font-mono font-bold text-emerald-400">
                + R$ {cashFlow.receivedBills.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-2 font-semibold text-zinc-100 bg-zinc-950/60 p-2 rounded">
              <span>(=) Total de Entradas Realizadas</span>
              <span className="font-mono text-emerald-300">R$ {cashFlow.totalInflow.toFixed(2)}</span>
            </div>

            <div className="flex justify-between pt-2">
              <span className="text-zinc-300 font-medium">
                3. Custos e Despesas Pagas (Insumos, Frascos, Aluguel e Operação)
              </span>
              <span className="font-mono font-bold text-rose-400">
                - R$ {cashFlow.totalOutflow.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pt-3 font-serif text-sm font-bold text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
              <span>Resultado Operacional Líquido do Período</span>
              <span className="font-mono">R$ {cashFlow.netBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
