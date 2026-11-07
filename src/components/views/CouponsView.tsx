import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit3, Trash2, Calendar, CheckCircle2, XCircle, Percent, DollarSign } from 'lucide-react';
import { Database } from '../../services/database';
import { Coupon } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const CouponsView: React.FC = () => {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Ativo' | 'Inativo' | 'Expirado'>('TODOS');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>>({
    code: '',
    description: '',
    discountType: 'PERCENT',
    value: 10,
    minOrderValue: 500,
    maxUses: 50,
    validUntil: '2026-12-31',
    status: 'Ativo',
  });

  const reloadData = async () => {
    setLoading(true);
    try {
      const data = await Database.getCoupons();
      setCoupons(data);
    } catch (err) {
      error('Falha ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENT',
      value: 10,
      minOrderValue: 500,
      maxUses: 50,
      validUntil: '2026-12-31',
      status: 'Ativo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      value: c.value,
      minOrderValue: c.minOrderValue,
      maxUses: c.maxUses,
      validUntil: c.validUntil,
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || formData.value <= 0) {
      error('Preencha os campos obrigatórios (Código e Valor do Desconto).');
      return;
    }

    const payload: Coupon = {
      id: editingCoupon ? editingCoupon.id : '',
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      value: Number(formData.value),
      minOrderValue: Number(formData.minOrderValue),
      maxUses: Number(formData.maxUses),
      usedCount: editingCoupon ? editingCoupon.usedCount : 0,
      validUntil: formData.validUntil,
      status: formData.status,
      createdAt: editingCoupon ? editingCoupon.createdAt : '',
    };

    const res = await Database.saveCoupon(payload);
    if (res.success) {
      success(res.message);
      setIsModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await Database.deleteCoupon(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    }
    setDeletingId(null);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Cupons & Campanhas Promocionais
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Crie códigos promocionais VIP, descontos por porcentagem ou valor fixo com limitação de resgate.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cupom</span>
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
            placeholder="Pesquisar por código promocional ou descrição..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(['TODOS', 'Ativo', 'Inativo', 'Expirado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((c) => {
          const usagePercent = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100));
          return (
            <div
              key={c.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
                      {c.code}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === 'Ativo'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : c.status === 'Expirado'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mt-2">{c.description}</p>

                <div className="mt-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Desconto:</span>
                    <span className="font-mono font-bold text-white">
                      {c.discountType === 'PERCENT' ? `${c.value}% OFF` : `R$ ${c.value.toFixed(2)} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pedido Mínimo:</span>
                    <span className="font-mono text-zinc-300">R$ {c.minOrderValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Validade:</span>
                    <span className="font-mono text-zinc-300">
                      {new Date(c.validUntil + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Usage progress */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Usos Realizados</span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {c.usedCount} de {c.maxUses} ({usagePercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                  title="Editar Cupom"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(c.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Excluir Cupom"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum cupom encontrado.
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Editar Cupom Promocional' : 'Cadastrar Novo Cupom'}
        subtitle="Regras de desconto e restrições de uso na boutique"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Código Promocional <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: NOIRVIP15"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Tipo de Desconto</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'FIXED' })
                }
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="PERCENT">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo em Reais (R$)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Valor do Desconto <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Pedido Mínimo (R$)</label>
              <input
                type="number"
                min={0}
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Limite de Resgates</label>
              <input
                type="number"
                min={1}
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Data Limite de Validade</label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Situação do Cupom</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'Ativo' | 'Inativo' | 'Expirado',
                  })
                }
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Expirado">Expirado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição Promocional</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: 15% de desconto especial na primeira compra de alta perfumaria"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
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
              {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Cupom Promocional"
        message="Tem certeza que deseja apagar este cupom de desconto?"
        confirmLabel="Sim, Excluir Cupom"
      />
    </div>
  );
};
