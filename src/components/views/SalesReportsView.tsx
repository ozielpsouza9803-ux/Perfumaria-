import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Database } from '../../services/database';
import { Order, Product } from '../../types';
import { useToast } from '../common/Toast';

type ReportPeriod = 'HOJE' | 'SEMANA' | 'MES' | 'TUDO';

export const SalesReportsView: React.FC = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportPeriod>('TUDO');

  const reload = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        Database.getOrders(),
        Database.getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      error('Falha ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // Filter orders by selected period
  const now = new Date();
  const filteredOrders = orders.filter((o) => {
    if (o.paymentStatus !== 'Aprovado') return false;
    const orderDate = new Date(o.createdAt);

    if (period === 'HOJE') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (period === 'SEMANA') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    if (period === 'MES') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true; // TUDO
  });

  // Calculations
  const grossRevenue = filteredOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = filteredOrders.length;
  const averageTicket = totalOrdersCount > 0 ? grossRevenue / totalOrdersCount : 0;

  // Calculate COGS (Custo das mercadorias vendidas)
  let totalCostOfGoods = 0;
  let totalBottlesSold = 0;
  const itemAggregation: Record<
    string,
    { name: string; sku: string; units: number; gross: number; cost: number }
  > = {};

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const unitPurchase = prod ? prod.purchasePrice : item.unitPrice * 0.35;
      const itemCost = unitPurchase * item.quantity;
      totalCostOfGoods += itemCost;
      totalBottlesSold += item.quantity;

      if (!itemAggregation[item.productId]) {
        itemAggregation[item.productId] = {
          name: item.productName,
          sku: item.sku,
          units: 0,
          gross: 0,
          cost: 0,
        };
      }
      itemAggregation[item.productId].units += item.quantity;
      itemAggregation[item.productId].gross += item.totalPrice;
      itemAggregation[item.productId].cost += itemCost;
    });
  });

  const netProfit = grossRevenue - totalCostOfGoods;
  const marginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const topItems = Object.values(itemAggregation).sort((a, b) => b.units - a.units);

  // Export CSV
  const exportCSV = () => {
    const headers = 'Numero_Pedido;Cliente;Data;Valor_Total;Forma_Pgto;Status\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `${o.orderNumber};"${o.customerName}";${new Date(o.createdAt).toLocaleDateString(
            'pt-BR'
          )};${o.total.toFixed(2)};${o.paymentMethod};${o.paymentStatus}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_vendas_maison_royale_${period.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Relatório CSV exportado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Relatórios Financeiros & Desempenho de Vendas
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Análise aprofundada de rentabilidade, custo de mercadoria vendida (CPV) e margens reais.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {(
            [
              { key: 'HOJE', label: 'Hoje' },
              { key: 'SEMANA', label: 'Últimos 7 Dias' },
              { key: 'MES', label: 'Este Mês' },
              { key: 'TUDO', label: 'Todo o Período' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setPeriod(t.key)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                period === t.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          {filteredOrders.length} pedido(s) liquidados no intervalo selecionado
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Receita Bruta Total</div>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            R$ {grossRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Pedidos aprovados e pagos</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Custo de Mercadoria (CPV)</div>
          <div className="text-2xl font-bold font-mono text-zinc-300 mt-2 tabular-nums">
            R$ {totalCostOfGoods.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Custo de compra dos {totalBottlesSold} frascos</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-medium">Lucro Líquido Contábil</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
            R$ {netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Resultado antes de impostos</div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs uppercase tracking-wider text-amber-300 font-medium">Margem Média Operacional</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-2 tabular-nums">
            {marginPercent.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Ticket médio: R$ {averageTicket.toFixed(2)}</div>
        </div>
      </div>

      {/* Performance by Fragrance Table */}
      <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="font-serif text-base font-semibold text-white">
              Demonstrativo por Fragrância Comercializada
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cálculo individual de receita, custo de importação e lucro gerado
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400">Total: {topItems.length} produtos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3 pl-2">Fragrância / SKU</th>
                <th className="pb-3 text-center">Frascos Vendidos</th>
                <th className="pb-3 text-right">Faturamento Bruto</th>
                <th className="pb-3 text-right">Custo de Aquisição</th>
                <th className="pb-3 text-right">Lucro Gerado</th>
                <th className="pb-3 pr-2 text-right">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {topItems.map((item) => {
                const itemProfit = item.gross - item.cost;
                const itemMargin = item.gross > 0 ? (itemProfit / item.gross) * 100 : 0;
                return (
                  <tr key={item.sku} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="font-semibold text-zinc-100">{item.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{item.sku}</div>
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-amber-300 tabular-nums">
                      {item.units} un
                    </td>
                    <td className="py-3 text-right font-mono text-white tabular-nums">
                      R$ {item.gross.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono text-zinc-400 tabular-nums">
                      R$ {item.cost.toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      R$ {itemProfit.toFixed(2)}
                    </td>
                    <td className="py-3 pr-2 text-right font-mono font-bold text-zinc-200 tabular-nums">
                      {itemMargin.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {topItems.length === 0 && (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhum perfume vendido no período selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
