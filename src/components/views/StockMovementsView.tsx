import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Database } from '../../services/database';
import { StockMovement, Product, MovementType } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export const StockMovementsView: React.FC = () => {
  const { currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | MovementType>('TODOS');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingMovement, setViewingMovement] = useState<StockMovement | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('ENTRADA');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [reason, setReason] = useState('');
  const [documentRef, setDocumentRef] = useState('');

  const reloadData = async () => {
    setLoading(true);
    try {
      const [movementsData, productsData] = await Promise.all([
        Database.getStockMovements(),
        Database.getProducts(),
      ]);
      setMovements(movementsData);
      setProducts(productsData);
    } catch (err) {
      error('Falha ao carregar dados de movimentação.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    const firstProd = products[0];
    setSelectedProductId(firstProd?.id || '');
    setMovementType('ENTRADA');
    setQuantity(1);
    setUnitCost(firstProd?.purchasePrice || 0);
    setReason('Entrada de lote importado');
    setDocumentRef('NF-e ' + Math.floor(1000 + Math.random() * 9000));
    setIsModalOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setUnitCost(p.purchasePrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      error('Selecione uma fragrância válida.');
      return;
    }
    if (quantity <= 0) {
      error('A quantidade deve ser maior que zero.');
      return;
    }

    const res = await Database.registerStockMovement({
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      type: movementType,
      quantity,
      previousStock: prod.stockQuantity,
      newStock:
        movementType === 'ENTRADA'
          ? prod.stockQuantity + quantity
          : prod.stockQuantity - quantity,
      unitCost: Number(unitCost),
      reason: reason.trim() || 'Movimentação manual',
      documentRef: documentRef.trim() || undefined,
      adminName: currentAdmin?.name || 'Administrador',
    });

    if (res.success) {
      success(res.message);
      setIsModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.documentRef && m.documentRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'TODOS' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Entrada & Saída de Mercadorias
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Registro contábil de notas fiscais de importação, expedição para clientes e baixas de estoque.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimentação</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por perfume, código SKU, nota fiscal ou motivo..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(['TODOS', 'ENTRADA', 'SAIDA', 'AJUSTE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pl-2">Data / Hora</th>
              <th className="pb-3">Tipo</th>
              <th className="pb-3">Fragrância & SKU</th>
              <th className="pb-3 text-center">Quantidade</th>
              <th className="pb-3 text-center">Evolução de Saldo</th>
              <th className="pb-3">Documento / NF</th>
              <th className="pb-3">Responsável</th>
              <th className="pb-3 pr-2 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredMovements.map((m) => (
              <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 pl-2 text-zinc-400 font-mono tabular-nums whitespace-nowrap">
                  {new Date(m.date).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.type === 'ENTRADA'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : m.type === 'SAIDA'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {m.type === 'ENTRADA' ? (
                      <ArrowDownLeft className="w-3 h-3" />
                    ) : m.type === 'SAIDA' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowLeftRight className="w-3 h-3" />
                    )}
                    {m.type}
                  </span>
                </td>
                <td className="py-3">
                  <div className="font-medium text-zinc-200">{m.productName}</div>
                  <div className="font-mono text-[10px] text-zinc-500">{m.productSku}</div>
                </td>
                <td className="py-3 text-center font-mono font-bold tabular-nums">
                  <span
                    className={
                      m.type === 'ENTRADA'
                        ? 'text-emerald-400'
                        : m.type === 'SAIDA'
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }
                  >
                    {m.type === 'ENTRADA' ? '+' : m.type === 'SAIDA' ? '-' : ''}
                    {m.quantity} un
                  </span>
                </td>
                <td className="py-3 text-center font-mono text-[11px] text-zinc-400 tabular-nums whitespace-nowrap">
                  {m.previousStock} un → <span className="text-zinc-100 font-bold">{m.newStock} un</span>
                </td>
                <td className="py-3 text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                  {m.documentRef || '—'}
                </td>
                <td className="py-3 text-zinc-400 text-[11px] whitespace-nowrap">{m.adminName}</td>
                <td className="py-3 pr-2 text-right">
                  <button
                    type="button"
                    onClick={() => setViewingMovement(m)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 rounded hover:bg-zinc-800 transition-colors"
                    title="Ver detalhes da movimentação"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMovements.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhuma movimentação localizada com os filtros selecionados.
        </div>
      )}

      {/* CREATE MOVEMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Entrada ou Saída de Frascos"
        subtitle="Movimentação auditada do estoque com atualização imediata"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Fragrância / Produto <span className="text-amber-400">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Saldo Atual: {p.stockQuantity} un
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tipo da Operação <span className="text-amber-400">*</span>
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="ENTRADA">ENTRADA (Importação, compra fornecedor, devolução)</option>
                <option value="SAIDA">SAÍDA (Venda direta, amostra showroom, descarte)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Quantidade de Frascos <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Documento / Nota Fiscal</label>
              <input
                type="text"
                value={documentRef}
                onChange={(e) => setDocumentRef(e.target.value)}
                placeholder="Ex: NF-e 004.891 / Invoice FR-202"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Motivo / Histórico Detalhado <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Recebimento de 20 unidades do ateliê de Grasse..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Confirmar e Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {viewingMovement && (
        <Modal
          isOpen={!!viewingMovement}
          onClose={() => setViewingMovement(null)}
          title="Detalhes da Movimentação de Estoque"
          subtitle={`Registro ID: ${viewingMovement.id}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Fragrância:</span>
                <span className="text-zinc-200 font-semibold">{viewingMovement.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SKU:</span>
                <span className="font-mono text-amber-400">{viewingMovement.productSku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tipo:</span>
                <span className="font-semibold text-zinc-100">{viewingMovement.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Quantidade:</span>
                <span className="font-mono font-bold text-amber-300">
                  {viewingMovement.quantity} frasco(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Saldo Anterior:</span>
                <span className="font-mono text-zinc-400">{viewingMovement.previousStock} un</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Novo Saldo Resultante:</span>
                <span className="font-mono font-bold text-zinc-100">
                  {viewingMovement.newStock} un
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Documento / NF-e:</span>
                <span className="font-mono text-zinc-300">{viewingMovement.documentRef || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Operador Responsável:</span>
                <span className="text-zinc-200">{viewingMovement.adminName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Data e Hora:</span>
                <span className="font-mono text-zinc-400">
                  {new Date(viewingMovement.date).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block font-medium mb-1">Motivo Declarado:</span>
              <p className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed">
                {viewingMovement.reason}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMovement(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
