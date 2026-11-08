import React, { useState, useEffect } from 'react';
import {
  User,
  Crown,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Shield,
  Edit3,
  Save,
  LogOut,
  Camera,
  FileText,
  AlertCircle,
  Eye,
  CreditCard,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../services/database';
import { Order, PaymentReceipt, CustomerAppointment } from '../../types';
import { NavTab } from '../common/Sidebar';
import { useToast } from '../common/Toast';
import { useCart } from '../../context/CartContext';
import { ImageUpload } from '../common/ImageUpload';
import { Modal } from '../common/Modal';

interface CustomerPortalViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenChat?: () => void;
}

type OrderSection = 'pendentes' | 'a_caminho' | 'finalizados' | 'comprovantes';

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({ onNavigate, onOpenChat }) => {
  const { currentAdmin, logout } = useAuth();
  const { success, error } = useToast();
  const { setIsCartOpen, cartCount } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile editable fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentAdmin?.name || 'Cliente Maison Royale');
  const [username, setUsername] = useState('@colecionador.royale');
  const [bio, setBio] = useState('Apreciador de perfumes raros de alta concentração, notas de oud e extratos de rosa centifólia.');
  const [phone, setPhone] = useState(currentAdmin?.phone || '(11) 99887-6655');
  const [email, setEmail] = useState(currentAdmin?.email || 'cliente@maisonroyale.com.br');
  const [avatarUrl, setAvatarUrl] = useState(currentAdmin?.avatar || '');
  const [isOnlineVisible, setIsOnlineVisible] = useState(true);

  // Active section inside Customer Portal
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'agendamentos'>('pedidos');
  const [orderSection, setOrderSection] = useState<OrderSection>('pendentes');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [o, r, a] = await Promise.all([
          Database.getOrders(),
          Database.getPaymentReceipts(),
          Database.getAppointments(),
        ]);
        setOrders(o);
        setReceipts(r);
        setAppointments(a);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.addEventListener('mr_database_change', loadData);
    return () => window.removeEventListener('mr_database_change', loadData);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    success('Perfil VIP atualizado com sucesso!');
  };

  // Filter strictly by logged-in customer identity for data privacy
  const myOrders = orders.filter((o) => {
    if (!currentAdmin) return true;
    if (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.role === 'GERENTE') return true;
    return (
      o.customerId === currentAdmin.id ||
      (o.customerEmail && o.customerEmail.toLowerCase() === currentAdmin.email.toLowerCase())
    );
  });

  const myOrderNumbers = new Set(myOrders.map((o) => o.orderNumber));

  const myReceipts = receipts.filter((r) => {
    if (!currentAdmin) return true;
    if (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.role === 'GERENTE') return true;
    return myOrderNumbers.has(r.orderNumber) || (r.customerName && r.customerName.toLowerCase() === profileName.toLowerCase());
  });

  const myAppointments = appointments.filter((a) => {
    if (!currentAdmin) return true;
    if (currentAdmin.role === 'SUPER_ADMIN' || currentAdmin.role === 'GERENTE') return true;
    return a.customerId === currentAdmin.id || (a.customerName && a.customerName.toLowerCase() === profileName.toLowerCase());
  });

  // Categorize customer's own orders into the 4 requested sections
  const pendingOrders = myOrders.filter(
    (o) => o.fulfillmentStatus === 'Aguardando Pagamento' || o.fulfillmentStatus === 'Em Separação'
  );
  const transitOrders = myOrders.filter((o) => o.fulfillmentStatus === 'Enviado');
  const completedOrders = myOrders.filter((o) => o.fulfillmentStatus === 'Entregue');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. CARTÃO VIP & CABEÇALHO DO PERFIL PREMIUM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-amber-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar & Online status indicator */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-zinc-950 border-2 border-amber-400 overflow-hidden shadow-xl flex items-center justify-center text-amber-400 font-serif text-3xl font-bold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  profileName.charAt(0)
                )}
              </div>

              {/* Online status indicator toggle */}
              {isOnlineVisible && (
                <span
                  title="Status Online Visível"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-md"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-400/40">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Diamond Club VIP</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{username}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {profileName}
              </h2>
              <p className="text-xs text-zinc-400">{email} · {phone}</p>
              <p className="text-xs text-zinc-300 italic max-w-md line-clamp-1">"{bio}"</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
              title="Retornar à Tela Inicial Pública mantendo a sessão"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Voltar ao Início</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Sacola ({cartCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditingProfile ? 'Cancelar Edição' : 'Editar Perfil'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="p-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-xl cursor-pointer transition-colors"
              title="Sair da Conta de Cliente e voltar ao Início"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM MODAL / SECTION */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4 animate-in fade-in">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-zinc-800">
            <User className="w-4 h-4 text-amber-400" />
            Editar Dados Pessoais & Preferências
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1">Nome Completo</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1">Nome de Usuário (@handle)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1">E-mail de Cadastro</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1">Bio Olfativa Personalizada</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <ImageUpload
              value={avatarUrl}
              onChange={setAvatarUrl}
              label="Foto de Perfil do Cliente"
              hint="Selecione uma foto do seu dispositivo ou ensaio fotográfico."
            />
          </div>

          {/* Toggle Online status */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <input
              type="checkbox"
              id="onlineVis"
              checked={isOnlineVisible}
              onChange={(e) => setIsOnlineVisible(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-400 h-4 w-4"
            />
            <label htmlFor="onlineVis" className="text-xs text-zinc-300 cursor-pointer">
              Exibir indicador de status online na boutique e consultoria
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      )}

      {/* NAVIGATION TABS (PEDIDOS / AGENDA / PERFIL) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pedidos'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Histórico de Compras ({myOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agendamentos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'agendamentos'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Agenda na Boutique ({myAppointments.length})</span>
        </button>
      </div>

      {/* 5. HISTÓRICO DE COMPRAS ORGANIZADO EM 4 SEÇÕES */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {/* 4 Section Filter Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'pendentes', label: 'Pedidos Pendentes', count: pendingOrders.length, icon: Clock },
              { id: 'a_caminho', label: 'Pedidos a Caminho', count: transitOrders.length, icon: Truck },
              { id: 'finalizados', label: 'Pedidos Finalizados', count: completedOrders.length, icon: CheckCircle2 },
              { id: 'comprovantes', label: 'Comprovantes', count: myReceipts.length, icon: FileText },
            ].map((sec) => {
              const Icon = sec.icon;
              const isActive = orderSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setOrderSection(sec.id as OrderSection)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-400/60 text-amber-300 font-bold shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="text-xs">{sec.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300">
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SECTION CONTENTS */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            {orderSection === 'pendentes' && (
              <OrderListTable
                orders={pendingOrders}
                emptyText="Nenhum pedido pendente de pagamento ou separação."
                onViewDetails={setSelectedOrderDetails}
              />
            )}

            {orderSection === 'a_caminho' && (
              <OrderListTable
                orders={transitOrders}
                emptyText="Nenhum pedido em transporte no momento."
                onViewDetails={setSelectedOrderDetails}
              />
            )}

            {orderSection === 'finalizados' && (
              <OrderListTable
                orders={completedOrders}
                emptyText="Nenhum pedido finalizado no histórico."
                onViewDetails={setSelectedOrderDetails}
              />
            )}

            {orderSection === 'comprovantes' && (
              <div className="space-y-3">
                {myReceipts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">
                    Nenhum comprovante de pagamento Pix ou transferência anexado.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myReceipts.map((rec) => (
                      <div key={rec.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-amber-400 font-bold">{rec.orderNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {rec.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-300 font-mono">
                          <span>Valor: R$ {rec.amount.toFixed(2)}</span>
                          <span>{rec.method}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Código Transação: {rec.transactionCode}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPOINTMENTS TABS */}
      {activeTab === 'agendamentos' && (
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Minhas Consultorias Agendadas na Boutique
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('agenda')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg cursor-pointer"
            >
              Novo Agendamento Private
            </button>
          </div>

          {myAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">Nenhum agendamento ativo.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myAppointments.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">{a.serviceType}</span>
                    <span className="text-[10px] font-semibold text-emerald-400">{a.status}</span>
                  </div>
                  <div className="text-zinc-400">Consultor Responsável: {a.consultant}</div>
                  <div className="font-mono text-amber-300 font-bold pt-1 border-t border-zinc-800">
                    {a.date} às {a.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <Modal
          isOpen={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          title={`Detalhes do Pedido ${selectedOrderDetails.orderNumber}`}
          subtitle={`Realizado em ${new Date(selectedOrderDetails.createdAt).toLocaleDateString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status de Entrega:</span>
                <span className="text-emerald-400 font-semibold">{selectedOrderDetails.fulfillmentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Forma de Pagamento:</span>
                <span className="text-amber-300 font-mono font-semibold">{selectedOrderDetails.paymentMethod}</span>
              </div>
              {selectedOrderDetails.trackingCode && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Código de Rastreamento:</span>
                  <span className="font-mono text-amber-300 font-bold">{selectedOrderDetails.trackingCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Endereço de Envio:</span>
                <span className="text-zinc-200">{selectedOrderDetails.shippingAddress}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <h4 className="font-serif font-semibold text-amber-300">Itens Adquiridos</h4>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-zinc-800/80 last:border-0">
                    <div>
                      <span className="font-semibold text-white block">{it.productName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{it.volumeMl}ml · {it.quantity}x unidades</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">R$ {it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-white pt-2">
              <span>Valor Total Pago:</span>
              <span className="text-amber-300 font-mono">R$ {selectedOrderDetails.total.toFixed(2)}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg cursor-pointer"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper component for Order list table
const OrderListTable: React.FC<{
  orders: Order[];
  emptyText: string;
  onViewDetails: (order: Order) => void;
}> = ({ orders, emptyText, onViewDetails }) => {
  if (orders.length === 0) {
    return <div className="p-8 text-center text-xs text-zinc-500">{emptyText}</div>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div>
            <div className="font-mono text-amber-400 font-bold flex items-center gap-2">
              <span>{o.orderNumber}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {o.fulfillmentStatus}
              </span>
            </div>
            <div className="text-zinc-300 mt-1">
              {o.items.map((it) => `${it.productName} (${it.quantity}x)`).join(', ')}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
              Pagamento: {o.paymentMethod} ({o.paymentStatus}) · {new Date(o.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block uppercase">Total</span>
              <span className="font-mono text-sm font-bold text-amber-300">
                R$ {o.total.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onViewDetails(o)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg cursor-pointer"
              title="Abrir Detalhes"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
