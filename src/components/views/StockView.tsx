import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  RefreshCw,
  Plus,
  ArrowLeftRight,
} from 'lucide-react';
import { Database } from '../../services/database';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { NavTab } from '../common/Sidebar';

interface StockViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const StockView: React.FC<StockViewProps> = ({ onNavigate }) => {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'TODOS' | 'BAIXO' | 'ZERADO'>('TODOS');

  // Quick Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Contagem periódica de inventário');

  const reloadData = async () => {
    setLoading(true);
    try {
      const data = await Database.getProducts();
      setProducts(data);
    } catch (err) {
      error('Falha ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const totalBottles = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalCost = products.reduce((acc, p) => acc + p.stockQuantity * p.purchasePrice, 0);
  const totalRetail = products.reduce((acc, p) => acc + p.stockQuantity * p.salePrice, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  const handleOpenAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setNewQuantity(p.stockQuantity);
    setAdjustReason('Contagem periódica de inventário');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    if (newQuantity < 0) {
      error('A quantidade não pode ser negativa.');
      return;
    }

    const res = await Database.registerStockMovement({
      productId: adjustingProduct.id,
      productName: adjustingProduct.name,
      productSku: adjustingProduct.sku,
      type: 'AJUSTE',
      quantity: Math.abs(newQuantity - adjustingProduct.stockQuantity),
      previousStock: adjustingProduct.stockQuantity,
      newStock: newQuantity,
      unitCost: adjustingProduct.purchasePrice,
      reason: adjustReason.trim() || 'Ajuste manual de saldo de estoque',
      documentRef: 'INVENTÁRIO-BALANÇO',
      adminName: 'Mestre Oziel Souza',
    });

    if (res.success) {
      success(res.message);
      setAdjustingProduct(null);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brandName && p.brandName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterType === 'BAIXO') {
      return matchesSearch && p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0;
    }
    if (filterType === 'ZERADO') {
      return matchesSearch && p.stockQuantity === 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Controle de Estoque & Balanço de Inventário
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão quantitativa de frascos nobres, valorização patrimonial e alertas de ruptura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('movements')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Entrada / Saída</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Frascos em Estoque</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalBottles} unidades
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{products.length} perfumes cadastrados</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Custo do Estoque</span>
          <div className="text-2xl font-bold font-mono text-zinc-200 mt-1 tabular-nums">
            R$ {totalCost.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Capital investido em insumos</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-medium">Potencial de Venda</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            R$ {totalRetail.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Valor de mercado da vitrine</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[11px] uppercase tracking-wider text-rose-400 font-medium">Alertas de Ruptura</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {lowStockCount} alertas
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Abaixo do limite de segurança</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por SKU, nome do perfume ou casa olfativa..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(
            [
              { key: 'TODOS', label: 'Todos os Frascos' },
              { key: 'BAIXO', label: 'Estoque Baixo' },
              { key: 'ZERADO', label: 'Esgotados' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                filterType === tab.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pl-2">Fragrância / SKU</th>
              <th className="pb-3">Casa Olfativa</th>
              <th className="pb-3 text-right">Preço Custo</th>
              <th className="pb-3 text-right">Preço Venda</th>
              <th className="pb-3 text-center">Saldo Atual</th>
              <th className="pb-3 text-center">Nível Mínimo</th>
              <th className="pb-3">Situação</th>
              <th className="pb-3 pr-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredProducts.map((p) => {
              const isAlert = p.stockQuantity <= p.minStockAlert;
              const isZero = p.stockQuantity === 0;
              return (
                <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 rounded object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-medium text-zinc-200 line-clamp-1">{p.name}</div>
                        <div className="font-mono text-[10px] text-amber-400">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-zinc-400">{p.brandName}</td>
                  <td className="py-3 text-right font-mono text-zinc-400 tabular-nums">
                    R$ {p.purchasePrice.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-mono font-medium text-amber-300 tabular-nums">
                    R$ {p.salePrice.toFixed(2)}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`font-mono text-sm font-bold tabular-nums px-2.5 py-0.5 rounded ${
                        isZero
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : isAlert
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'text-zinc-100'
                      }`}
                    >
                      {p.stockQuantity} un
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono text-zinc-500 tabular-nums">
                    {p.minStockAlert} un
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        isZero
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : isAlert
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isZero ? 'Esgotado' : isAlert ? 'Estoque Crítico' : 'Normal'}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenAdjust(p)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded text-[11px] font-medium transition-colors"
                    >
                      Ajustar Saldo
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* QUICK ADJUST MODAL */}
      {adjustingProduct && (
        <Modal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          title={`Ajuste de Estoque — ${adjustingProduct.name}`}
          subtitle={`SKU: ${adjustingProduct.sku} · Saldo Anterior: ${adjustingProduct.stockQuantity} frascos`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nova Quantidade Física em Estoque
              </label>
              <input
                type="number"
                min={0}
                required
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Motivo / Justificativa do Ajuste
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ex: Auditoria anual, correção de avaria, bonificação"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Diferença:</span>
                <span
                  className={`font-mono font-semibold ${
                    newQuantity - adjustingProduct.stockQuantity >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {newQuantity - adjustingProduct.stockQuantity >= 0 ? '+' : ''}
                  {newQuantity - adjustingProduct.stockQuantity} frasco(s)
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Uma movimentação do tipo "AJUSTE" será gerada no livro fiscal com registro do operador.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Confirmar Ajuste
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
