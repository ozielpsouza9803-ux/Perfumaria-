import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  UserCheck,
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Calendar,
  Globe,
  FileText,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import { Database } from '../../services/database';
import { Customer, Supplier, AdminUser, AdminRole } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export type CadastrosSubTab = 'clientes' | 'fornecedores' | 'funcionarios';

interface CadastrosViewProps {
  initialSubTab?: CadastrosSubTab;
}

export const CadastrosView: React.FC<CadastrosViewProps> = ({ initialSubTab = 'clientes' }) => {
  const { currentAdmin, registerAuthorizedAdmin } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<CadastrosSubTab>(initialSubTab);

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Customer Modals & Form
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerFormData, setCustomerFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    city: 'São Paulo',
    state: 'SP',
    address: '',
    vipTier: 'Standard',
    totalSpent: 0,
    ordersCount: 0,
    notes: '',
  });

  // Supplier Modals & Form
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id' | 'createdAt'>>({
    companyName: '',
    tradeName: '',
    cnpjOrVat: '',
    category: 'Essências & Óleos Nobres',
    country: 'França (Grasse)',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    status: 'Ativo',
    paymentTerms: '30 dias líquidos',
    notes: '',
  });

  // Operator / Employee Modal & Form
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [opName, setOpName] = useState('');
  const [opEmail, setOpEmail] = useState('');
  const [opRole, setOpRole] = useState<AdminRole>('CONSULTOR');
  const [opPhone, setOpPhone] = useState('');
  const [opPassword, setOpPassword] = useState('');
  const [opAuthKey, setOpAuthKey] = useState('MR-PARFUM-2026-KEY');

  // Deletion state
  const [deletingType, setDeletingType] = useState<'customer' | 'supplier' | 'operator' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [cData, sData, aData] = await Promise.all([
        Database.getCustomers(),
        Database.getSuppliers(),
        Database.getAdmins(),
      ]);
      setCustomers(cData);
      setSuppliers(sData);
      setAdmins(aData);
    } catch (err) {
      error('Falha ao sincronizar dados de cadastros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('mr_database_change', reloadData);
    return () => window.removeEventListener('mr_database_change', reloadData);
  }, []);

  // Customer Actions
  const handleOpenCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      city: 'São Paulo',
      state: 'SP',
      address: '',
      vipTier: 'Standard',
      totalSpent: 0,
      ordersCount: 0,
      notes: '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustomerFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      cpf: c.cpf,
      city: c.city,
      state: c.state,
      address: c.address || '',
      vipTier: c.vipTier,
      totalSpent: c.totalSpent,
      ordersCount: c.ordersCount,
      notes: c.notes || '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormData.name.trim() || !customerFormData.email.trim()) {
      error('Preencha os campos obrigatórios (Nome e E-mail).');
      return;
    }

    const payload: Customer = {
      id: editingCustomer ? editingCustomer.id : '',
      name: customerFormData.name.trim(),
      email: customerFormData.email.trim(),
      phone: customerFormData.phone.trim(),
      cpf: customerFormData.cpf.trim(),
      city: customerFormData.city.trim(),
      state: customerFormData.state.trim().toUpperCase(),
      address: customerFormData.address?.trim(),
      vipTier: customerFormData.vipTier,
      totalSpent: Number(customerFormData.totalSpent) || 0,
      ordersCount: Number(customerFormData.ordersCount) || 0,
      notes: customerFormData.notes?.trim(),
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    const res = await Database.saveCustomer(payload);
    if (res.success) {
      success(res.message);
      setIsCustomerModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  // Supplier Actions
  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierFormData({
      companyName: '',
      tradeName: '',
      cnpjOrVat: '',
      category: 'Essências & Óleos Nobres',
      country: 'França (Grasse)',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      status: 'Ativo',
      paymentTerms: '30 dias líquidos',
      notes: '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierFormData({
      companyName: s.companyName,
      tradeName: s.tradeName,
      cnpjOrVat: s.cnpjOrVat,
      category: s.category,
      country: s.country,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      website: s.website || '',
      status: s.status,
      paymentTerms: s.paymentTerms,
      notes: s.notes || '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.companyName.trim() || !supplierFormData.country.trim()) {
      error('Preencha a Razão Social e o País de Origem do fornecedor.');
      return;
    }

    const payload: Supplier = {
      id: editingSupplier ? editingSupplier.id : '',
      companyName: supplierFormData.companyName.trim(),
      tradeName: supplierFormData.tradeName.trim() || supplierFormData.companyName.trim(),
      cnpjOrVat: supplierFormData.cnpjOrVat.trim(),
      category: supplierFormData.category,
      country: supplierFormData.country.trim(),
      contactName: supplierFormData.contactName.trim(),
      email: supplierFormData.email.trim(),
      phone: supplierFormData.phone.trim(),
      website: supplierFormData.website?.trim(),
      status: supplierFormData.status,
      paymentTerms: supplierFormData.paymentTerms.trim(),
      notes: supplierFormData.notes?.trim(),
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toISOString(),
    };

    const res = await Database.saveSupplier(payload);
    if (res.success) {
      success(res.message);
      setIsSupplierModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  // Operator Actions
  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opName.trim() || !opEmail.trim() || !opPassword) {
      error('Preencha os campos obrigatórios do operador.');
      return;
    }

    const res = await registerAuthorizedAdmin(
      opName.trim(),
      opEmail.trim(),
      opRole,
      opPhone.trim(),
      opPassword,
      opAuthKey.trim()
    );

    if (res.success) {
      success(res.message);
      setIsOperatorModalOpen(false);
      setOpName('');
      setOpEmail('');
      setOpPhone('');
      setOpPassword('');
      reloadData();
    } else {
      error(res.message);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingId || !deletingType) return;

    if (deletingType === 'customer') {
      const res = await Database.deleteCustomer(deletingId);
      if (res.success) success(res.message);
      else error(res.message);
    } else if (deletingType === 'supplier') {
      const res = await Database.deleteSupplier(deletingId);
      if (res.success) success(res.message);
      else error(res.message);
    } else if (deletingType === 'operator') {
      if (currentAdmin) {
        const res = await Database.deleteAdmin(deletingId, currentAdmin.id);
        if (res.success) success(res.message);
        else error(res.message);
      }
    }

    setDeletingType(null);
    setDeletingId(null);
    reloadData();
  };

  // Filters
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Módulo 2: Cadastros Centrais
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão integrada de Clientes VIP, Fornecedores Mundiais e Equipe Operacional da Maison Royale.
          </p>
        </div>

        {/* Primary Action Button based on active sub-tab */}
        {activeTab === 'clientes' && (
          <button
            type="button"
            onClick={handleOpenCreateCustomer}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cliente VIP</span>
          </button>
        )}

        {activeTab === 'fornecedores' && (
          <button
            type="button"
            onClick={handleOpenCreateSupplier}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Fornecedor</span>
          </button>
        )}

        {activeTab === 'funcionarios' && (
          <button
            type="button"
            onClick={() => setIsOperatorModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Operador</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
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
          <span>Clientes VIP & Colecionadores ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fornecedores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'fornecedores'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Fornecedores de Insumos & Frascos ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('funcionarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'funcionarios'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Funcionários & Operadores ({admins.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'clientes'
                ? 'Buscar cliente por nome, e-mail ou cidade...'
                : activeTab === 'fornecedores'
                ? 'Buscar fornecedor por razão social, insumo ou país...'
                : 'Buscar funcionário por nome, e-mail ou perfil...'
            }
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* TAB 1: CLIENTES */}
      {activeTab === 'clientes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const isDiamond = c.vipTier === 'Diamond Club';
            const isGold = c.vipTier === 'Gold VIP';
            return (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                          {c.name}
                        </h3>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span>
                            {c.city} - {c.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                        isDiamond
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/50'
                          : isGold
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {c.vipTier}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Total em Compras</span>
                      <span className="font-mono font-bold text-amber-300">
                        R$ {c.totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block">Pedidos</span>
                      <span className="font-mono text-zinc-300 font-semibold">{c.ordersCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCustomer(c)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar Cliente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingType('customer');
                      setDeletingId(c.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: FORNECEDORES */}
      {activeTab === 'fornecedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                        {s.tradeName}
                      </h3>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-zinc-500" />
                        <span>{s.country}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                      s.status === 'Ativo'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
                    {s.category}
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Razão Social: <span className="text-zinc-300">{s.companyName}</span>
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Contato: <span className="text-zinc-300">{s.contactName} ({s.email})</span>
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Condição: <span className="text-zinc-300 font-mono">{s.paymentTerms}</span>
                  </div>
                </div>

                {s.notes && (
                  <p className="mt-3 text-xs text-zinc-500 italic bg-zinc-950/60 p-2.5 rounded border border-zinc-800/60 line-clamp-2">
                    "{s.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => handleOpenEditSupplier(s)}
                  className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Editar Fornecedor"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingType('supplier');
                    setDeletingId(s.id);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Excluir Fornecedor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: FUNCIONÁRIOS E OPERADORES */}
      {activeTab === 'funcionarios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((a) => {
            const isCurrent = a.id === currentAdmin?.id;
            return (
              <div
                key={a.id}
                className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                          <span>{a.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                              Você
                            </span>
                          )}
                        </h3>
                        <div className="text-xs text-amber-400 font-mono font-medium">
                          {a.role}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                        a.active
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {a.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="text-zinc-300 truncate">{a.email}</span>
                    </div>
                    {a.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="text-zinc-300">{a.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
                    Último acesso:{' '}
                    {a.lastLogin
                      ? new Date(a.lastLogin).toLocaleDateString('pt-BR')
                      : 'Nunca acessou'}
                  </div>
                </div>

                {!isCurrent && currentAdmin?.role === 'SUPER_ADMIN' && (
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingType('operator');
                        setDeletingId(a.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Revogar Acesso do Operador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CADASTRAR / EDITAR CLIENTE */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Editar Ficha do Cliente VIP' : 'Cadastrar Cliente VIP'}
        subtitle="Dados de perfil, contato e categoria de relacionamento"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome Completo do Cliente <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={customerFormData.name}
              onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
              placeholder="Ex: Dra. Viviane Albuquerque"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail Pessoal / Corporativo <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={customerFormData.email}
                onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                placeholder="viviane@albuquerque.com.br"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={customerFormData.phone}
                onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">CPF</label>
              <input
                type="text"
                value={customerFormData.cpf}
                onChange={(e) => setCustomerFormData({ ...customerFormData, cpf: e.target.value })}
                placeholder="123.456.789-00"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Cidade</label>
              <input
                type="text"
                value={customerFormData.city}
                onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })}
                placeholder="São Paulo"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Estado</label>
              <input
                type="text"
                maxLength={2}
                value={customerFormData.state}
                onChange={(e) => setCustomerFormData({ ...customerFormData, state: e.target.value.toUpperCase() })}
                placeholder="SP"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Endereço de Entrega VIP</label>
            <input
              type="text"
              value={customerFormData.address || ''}
              onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
              placeholder="Rua Bela Cintra, 1890, Apto 210 - Jardins"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Categoria de Fidelidade</label>
            <select
              value={customerFormData.vipTier}
              onChange={(e) => setCustomerFormData({ ...customerFormData, vipTier: e.target.value as any })}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Standard">Standard (Cliente Cadastrado)</option>
              <option value="Gold VIP">Gold VIP (Mais de R$ 2.000 em compras)</option>
              <option value="Diamond Club">Diamond Club (Colecionador acima de R$ 5.000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Notas Sensoriais & Preferências</label>
            <textarea
              rows={2}
              value={customerFormData.notes || ''}
              onChange={(e) => setCustomerFormData({ ...customerFormData, notes: e.target.value })}
              placeholder="Famílias olfativas favoritas, notas que prefere evitar, ocasiões..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
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

      {/* MODAL: CADASTRAR / EDITAR FORNECEDOR */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Fornecedor de Insumos'}
        subtitle="Ateliês olfativos, produtores de vidro, atomizadores e embalagens de luxo"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Razão Social <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierFormData.companyName}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, companyName: e.target.value })}
                placeholder="Ex: Distilleries de Grasse SARL"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={supplierFormData.tradeName}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, tradeName: e.target.value })}
                placeholder="Ex: Grasse Essences"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">CNPJ / VAT / NIF</label>
              <input
                type="text"
                value={supplierFormData.cnpjOrVat}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, cnpjOrVat: e.target.value })}
                placeholder="FR-99120482"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                País de Origem <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={supplierFormData.country}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, country: e.target.value })}
                placeholder="França"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Categoria de Insumo</label>
              <select
                value={supplierFormData.category}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Essências & Óleos Nobres">Essências & Óleos Nobres</option>
                <option value="Vidraria & Frascos">Vidraria & Frascos</option>
                <option value="Válvulas & Atomizadores">Válvulas & Atomizadores</option>
                <option value="Embalagens & Estojos">Embalagens & Estojos</option>
                <option value="Insumos de Laboratório">Insumos de Laboratório</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Contato do Gerente Comercial</label>
              <input
                type="text"
                value={supplierFormData.contactName}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, contactName: e.target.value })}
                placeholder="Ex: Antoine Laurent"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={supplierFormData.email}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                placeholder="comercial@grasse.fr"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Condição de Pagamento</label>
              <input
                type="text"
                value={supplierFormData.paymentTerms}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, paymentTerms: e.target.value })}
                placeholder="Ex: 30 dias líquidos"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Status Operacional</label>
              <select
                value={supplierFormData.status}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Ativo">Ativo (Habilitado para pedidos de compra)</option>
                <option value="Em Homologação">Em Homologação (Avaliação de amostras)</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Notas & Especificações Técnicas</label>
            <textarea
              rows={2}
              value={supplierFormData.notes || ''}
              onChange={(e) => setSupplierFormData({ ...supplierFormData, notes: e.target.value })}
              placeholder="Certificações IFRA, procedência de colheita, tempo de entrega..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CADASTRAR FUNCIONÁRIO / OPERADOR */}
      <Modal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        title="Cadastrar Funcionário / Operador"
        subtitle="Credenciamento oficial de acesso para a equipe da Maison Royale"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveOperator} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome Completo do Funcionário <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={opName}
              onChange={(e) => setOpName(e.target.value)}
              placeholder="Ex: Fernando Vasconcelos"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                E-mail Corporativo <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={opEmail}
                onChange={(e) => setOpEmail(e.target.value)}
                placeholder="fernando@maisonroyale.com.br"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Telefone</label>
              <input
                type="text"
                value={opPhone}
                onChange={(e) => setOpPhone(e.target.value)}
                placeholder="(11) 98888-2026"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nível de Acesso (Cargo)</label>
              <select
                value={opRole}
                onChange={(e) => setOpRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="GERENTE">Gerente Geral (10 módulos)</option>
                <option value="ESTOQUISTA">Estoquista & Expedição (6 módulos)</option>
                <option value="CONSULTOR">Consultor Olfativo VIP (6 módulos)</option>
                <option value="SUPER_ADMIN">Super Administrador (14 módulos)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Senha Provisória <span className="text-amber-400">*</span>
              </label>
              <input
                type="password"
                required
                value={opPassword}
                onChange={(e) => setOpPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1">Chave Mestra de Autorização</label>
            <input
              type="text"
              required
              value={opAuthKey}
              onChange={(e) => setOpAuthKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-500/30 rounded-lg text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsOperatorModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Cadastrar Operador
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => {
          setDeletingType(null);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão de Registro"
        message="Tem certeza que deseja remover este cadastro? Esta operação atualizará a base de dados administrativa da Maison Royale."
        confirmLabel="Sim, Excluir Cadastro"
      />
    </div>
  );
};
