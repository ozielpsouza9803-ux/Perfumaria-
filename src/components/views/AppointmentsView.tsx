import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Sparkles,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Database } from '../../services/database';
import { CustomerAppointment, Customer, AppointmentStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

const SERVICE_TYPES = [
  'Consultoria Olfativa Exclusiva',
  'Degustação de Fragrâncias Raras',
  'Personalização de Frascos & Gravação',
  'Atendimento VIP Private Room',
] as const;

export const AppointmentsView: React.FC = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | AppointmentStatus>('TODOS');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CustomerAppointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<CustomerAppointment, 'id' | 'createdAt'>>({
    customerId: '',
    customerName: '',
    customerPhone: '',
    serviceType: 'Consultoria Olfativa Exclusiva',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    consultant: 'Mestre Oziel Souza',
    status: 'Agendado',
    notes: '',
  });

  const reloadData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, customersData] = await Promise.all([
        Database.getAppointments(),
        Database.getCustomers(),
      ]);
      setAppointments(appointmentsData);
      setCustomers(customersData);
    } catch (err) {
      error('Falha ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingApp(null);
    const firstCust = customers[0];
    setFormData({
      customerId: firstCust?.id || '',
      customerName: firstCust?.name || '',
      customerPhone: firstCust?.phone || '',
      serviceType: 'Consultoria Olfativa Exclusiva',
      date: new Date().toISOString().split('T')[0],
      time: '15:00',
      consultant: 'Mestre Oziel Souza',
      status: 'Agendado',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleCustomerSelect = (custId: string) => {
    const c = customers.find((x) => x.id === custId);
    if (c) {
      setFormData({
        ...formData,
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
      });
    }
  };

  const handleOpenEdit = (app: CustomerAppointment) => {
    setEditingApp(app);
    setFormData({
      customerId: app.customerId,
      customerName: app.customerName,
      customerPhone: app.customerPhone,
      serviceType: app.serviceType,
      date: app.date,
      time: app.time,
      consultant: app.consultant,
      status: app.status,
      notes: app.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.date || !formData.time) {
      error('Preencha os campos obrigatórios de data, horário e cliente.');
      return;
    }

    const payload: CustomerAppointment = {
      id: editingApp ? editingApp.id : '',
      customerId: formData.customerId,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      serviceType: formData.serviceType,
      date: formData.date,
      time: formData.time,
      consultant: formData.consultant.trim(),
      status: formData.status,
      notes: formData.notes?.trim(),
      createdAt: editingApp ? editingApp.createdAt : '',
    };

    const res = await Database.saveAppointment(payload);
    if (res.success) {
      success(res.message);
      setIsModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const handleQuickStatusChange = async (app: CustomerAppointment, newStatus: AppointmentStatus) => {
    const updated = { ...app, status: newStatus };
    const res = await Database.saveAppointment(updated);
    if (res.success) {
      success(`Status alterado para "${newStatus}".`);
      reloadData();
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await Database.deleteAppointment(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    }
    setDeletingId(null);
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.consultant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Agenda de Clientes & Ateliê Olfativo
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Sessões privadas de degustação olfativa, personalização de frascos e atendimento em sala reservada.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Sessão VIP</span>
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
            placeholder="Pesquisar por cliente, consultor ou tipo de experiência..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto overflow-x-auto">
          {(['TODOS', 'Agendado', 'Em Atendimento', 'Concluído', 'Cancelado'] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Appointments Cards / Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {app.serviceType}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    app.status === 'Agendado'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : app.status === 'Em Atendimento'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse'
                      : app.status === 'Concluído'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {app.status}
                </span>
              </div>

              {/* Date & Time Badge */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 my-3">
                <div className="flex items-center gap-1.5 font-mono text-zinc-100">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{new Date(app.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{app.time}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-zinc-200">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="font-semibold">{app.customerName}</span>
                </div>
                {app.customerPhone && (
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{app.customerPhone}</span>
                  </div>
                )}
                <div className="text-[11px] text-zinc-400 pt-1">
                  Consultor Responsável: <span className="text-zinc-200 font-medium">{app.consultant}</span>
                </div>
              </div>

              {app.notes && (
                <div className="mt-3 p-2.5 rounded bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                  {app.notes}
                </div>
              )}
            </div>

            {/* Actions & Status Quick Toggles */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {app.status === 'Agendado' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(app, 'Em Atendimento')}
                    className="px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-medium hover:bg-cyan-900"
                  >
                    Iniciar Atendimento
                  </button>
                )}
                {app.status === 'Em Atendimento' && (
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(app, 'Concluído')}
                    className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-medium hover:bg-emerald-900"
                  >
                    Concluir
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(app)}
                  className="p-1.5 text-zinc-400 hover:text-amber-300 rounded hover:bg-zinc-800 transition-colors"
                  title="Editar Agendamento"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(app.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                  title="Excluir Agendamento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum agendamento encontrado no período.
        </div>
      )}

      {/* CREATE / EDIT APPOINTMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingApp ? 'Editar Agendamento' : 'Novo Agendamento Olfativo'}
        subtitle="Reserve um horário exclusivo para o cliente no ateliê"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Selecionar Cliente Cadastrado
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="">Cliente Avulso / Não cadastrado</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.vipTier})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nome do Cliente <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Nome do cliente VIP"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Telefone de Contato</label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="(11) 99876-1234"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Tipo de Experiência / Atendimento
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceType: e.target.value as CustomerAppointment['serviceType'],
                })
              }
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Data do Atendimento <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Horário <span className="text-amber-400">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as AppointmentStatus })
                }
                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Agendado">Agendado</option>
                <option value="Em Atendimento">Em Atendimento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Consultor / Perfumista</label>
            <input
              type="text"
              required
              value={formData.consultant}
              onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
              placeholder="Ex: Mestre Oziel Souza"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Notas & Preparação Sensorial
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Preparações especiais, amostras de âmbar ou gravação personalizada..."
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
              {editingApp ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Cancelar e Excluir Agendamento"
        message="Deseja remover este agendamento da agenda oficial de atendimento?"
        confirmLabel="Sim, Excluir"
      />
    </div>
  );
};
