import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  MessageCircle,
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Database } from '../../services/database';
import { Customer, CustomerVipTier, Order } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const CustomersView: React.FC = () => {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState<string>('TODOS');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'totalSpent' | 'ordersCount'>>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    city: 'São Paulo',
    state: 'SP',
    address: '',
    vipTier: 'Standard',
    notes: '',
  });

  const reloadData = async () => {
    setLoading(true);
    try {
      const [customersData, ordersData] = await Promise.all([
        Database.getCustomers(),
        Database.getOrders(),
      ]);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (err) {
      error('Falha ao carregar dados de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      city: 'São Paulo',
      state: 'SP',
      address: '',
      vipTier: 'Standard',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      cpf: c.cpf,
      city: c.city,
      state: c.state,
      address: c.address || '',
      vipTier: c.vipTier,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      error('Preencha os campos obrigatórios (Nome e E-mail).');
      return;
    }

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : '',
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      cpf: formData.cpf.trim(),
      city: formData.city.trim(),
      state: formData.state.trim().toUpperCase(),
      address: formData.address?.trim(),
      vipTier: formData.vipTier,
      notes: formData.notes?.trim(),
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
      ordersCount: editingCustomer ? editingCustomer.ordersCount : 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : '',
    };

    const res = await Database.saveCustomer(payload);
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
    const res = await Database.deleteCustomer(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    } else {
      error(res.message);
    }
    setDeletingId(null);
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    if (!cleanNumber) {
      error('Cliente sem número de telefone cadastrado.');
      return;
    }
    const msg = encodeURIComponent(
      `Olá, ${name}! Aqui é o Concierge da Maison Royale Parfumerie. É um prazer falar com você.`
    );
    window.open(`https://wa.me/55${cleanNumber}?text=${msg}`, '_blank');
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVip = vipFilter === 'TODOS' || c.vipTier === vipFilter;
    return matchesSearch && matchesVip;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Gestão de Clientes & Membros VIP
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Histórico exclusivo de compras, relacionamento de alta fidelidade e canal direto via Concierge.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Cliente</span>
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
            placeholder="Pesquisar por nome, CPF, e-mail ou cidade do cliente..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(['TODOS', 'Standard', 'Gold VIP', 'Diamond Club'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setVipFilter(tier)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                vipFilter === tier
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pl-2">Cliente</th>
              <th className="pb-3">Categoria VIP</th>
              <th className="pb-3">Contato & Local</th>
              <th className="pb-3 text-center">Pedidos</th>
              <th className="pb-3 text-right">Total Acumulado</th>
              <th className="pb-3 pr-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-100">{c.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">CPF: {c.cpf || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.vipTier === 'Diamond Club'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        : c.vipTier === 'Gold VIP'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    {c.vipTier}
                  </span>
                </td>
                <td className="py-3">
                  <div className="text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{c.email}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{c.phone}</span>
                    <span>·</span>
                    <span>
                      {c.city}/{c.state}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center font-mono font-medium text-zinc-300 tabular-nums">
                  {c.ordersCount} compra(s)
                </td>
                <td className="py-3 text-right font-mono font-bold text-amber-300 tabular-nums">
                  R$ {c.totalSpent.toFixed(2)}
                </td>
                <td className="py-3 pr-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openWhatsApp(c.phone, c.name)}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded transition-colors"
                      title="Concierge WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingCustomer(c)}
                      className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                      title="Ficha Completa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                      title="Editar Dados"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(c.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum cliente encontrado com os parâmetros pesquisados.
        </div>
      )}

      {/* CREATE / EDIT CUSTOMER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Editar Ficha do Cliente' : 'Cadastrar Novo Cliente'}
        subtitle="Dados cadastrais e classificação de atendimento"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome Completo <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Dra. Camila Albuquerque Fontes"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@email.com"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99876-1234"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="São Paulo"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">UF (Estado)</label>
              <input
                type="text"
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="SP"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono uppercase focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Endereço Residencial / Comercial</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Brigadeiro Faria Lima, 3477 - Apto 142"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Classificação VIP</label>
            <select
              value={formData.vipTier}
              onChange={(e) => setFormData({ ...formData, vipTier: e.target.value as CustomerVipTier })}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Standard">Standard (Cliente Inicial)</option>
              <option value="Gold VIP">Gold VIP (Mais de R$ 1.500 em compras)</option>
              <option value="Diamond Club">Diamond Club (Mais de R$ 4.000 em compras / Atendimento Private)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Preferências Olfativas & Observações Concierge
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Aprecia acordes de oud, madeiras nobres, perfumes de frasco numerado..."
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
              {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW CUSTOMER PROFILE MODAL */}
      {viewingCustomer && (
        <Modal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={`Perfil de Cliente: ${viewingCustomer.name}`}
          subtitle={`Membro ${viewingCustomer.vipTier} · Cadastro em ${new Date(viewingCustomer.createdAt).toLocaleDateString('pt-BR')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-1">Total Gasto</span>
                <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                  R$ {viewingCustomer.totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-1">Pedidos Realizados</span>
                <span className="font-mono text-base font-bold text-zinc-100 tabular-nums">
                  {viewingCustomer.ordersCount} compras
                </span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                <span className="text-zinc-500 block mb-1">Classificação</span>
                <span className="font-bold text-cyan-300 block">{viewingCustomer.vipTier}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">E-mail:</span>
                <span className="text-zinc-200">{viewingCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Telefone:</span>
                <span className="text-zinc-200">{viewingCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CPF:</span>
                <span className="font-mono text-zinc-200">{viewingCustomer.cpf || 'Não cadastrado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Endereço:</span>
                <span className="text-zinc-200">
                  {viewingCustomer.address ? `${viewingCustomer.address}, ` : ''}
                  {viewingCustomer.city}/{viewingCustomer.state}
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block font-medium mb-1">Preferências & Histórico Concierge:</span>
              <p className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-zinc-300 leading-relaxed">
                {viewingCustomer.notes || 'Sem observações olfativas registradas.'}
              </p>
            </div>

            {/* Customer Orders */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase mb-2">Histórico de Pedidos:</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {orders.filter((o) => o.customerId === viewingCustomer.id).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Nenhum pedido registrado no sistema.</p>
                ) : (
                  orders
                    .filter((o) => o.customerId === viewingCustomer.id)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800/80"
                      >
                        <div>
                          <span className="font-mono text-amber-300 font-medium">#{ord.orderNumber}</span>
                          <span className="text-zinc-500 text-[11px] ml-2">
                            {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {ord.paymentStatus}
                          </span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            R$ {ord.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openWhatsApp(viewingCustomer.phone, viewingCustomer.name)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Remover Cadastro de Cliente"
        message="Tem certeza que deseja excluir os dados deste cliente da base de dados centralizada?"
        confirmLabel="Sim, Remover Cliente"
      />
    </div>
  );
};
