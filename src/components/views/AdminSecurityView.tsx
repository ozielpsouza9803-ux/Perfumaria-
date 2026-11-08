import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserCheck,
  KeyRound,
  UserPlus,
  Lock,
  Trash2,
  Clock,
  CheckCircle2,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../services/database';
import { AdminUser, AdminRole, AuditLog } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const AdminSecurityView: React.FC = () => {
  const { currentAdmin, changePassword, registerAuthorizedAdmin, updateProfile, setTestingRole } = useAuth();
  const { success, error } = useToast();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Profile update state
  const [name, setName] = useState(currentAdmin?.name || '');
  const [phone, setPhone] = useState(currentAdmin?.phone || '');

  // Add Admin modal state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('GERENTE');
  const [regPassword, setRegPassword] = useState('');
  const [regAuthKey, setRegAuthKey] = useState('MR-PARFUM-2026-KEY');

  // Delete admin state
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [adminsData, auditData] = await Promise.all([
        Database.getAdmins(),
        Database.getAuditLogs(),
      ]);
      setAdmins(adminsData);
      setAuditLogs(auditData);
    } catch (err) {
      error('Falha ao carregar dados de segurança.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      error('Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPass.length < 6) {
      error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      error('A confirmação da nova senha não confere.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsChangingPass(false);

    if (res.success) {
      success(res.message);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      error(res.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('O nome não pode estar em branco.');
      return;
    }
    const ok = await updateProfile({ name: name.trim(), phone: phone.trim() });
    if (ok) {
      success('Dados do perfil atualizados com êxito!');
      reloadData();
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      error('Preencha os campos obrigatórios do novo administrador.');
      return;
    }

    const res = await registerAuthorizedAdmin(
      regName,
      regEmail,
      regRole,
      regPhone,
      regPassword,
      regAuthKey
    );

    if (res.success) {
      success(res.message);
      setIsAddAdminOpen(false);
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      reloadData();
    } else {
      error(res.message);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!deletingAdminId || !currentAdmin) return;
    const res = await Database.deleteAdmin(deletingAdminId, currentAdmin.id);
    if (res.success) {
      success(res.message);
      reloadData();
    } else {
      error(res.message);
    }
    setDeletingAdminId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Perfil & Segurança do Administrador
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gerenciamento de credenciais, controle de operadores autorizados e auditoria do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Password */}
        <div className="space-y-6">
          {/* Current Admin Profile Card */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center font-bold text-base shadow-sm">
                {currentAdmin?.name.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-white">{currentAdmin?.name}</h3>
                <span className="text-xs text-amber-400 font-mono">{currentAdmin?.role}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">E-mail Corporativo (Login)</label>
                <input
                  type="email"
                  disabled
                  value={currentAdmin?.email || ''}
                  className="w-full px-3 py-1.5 bg-zinc-950/60 border border-zinc-800/80 rounded text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded transition-colors"
                >
                  Salvar Dados do Perfil
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm font-semibold text-white">Redefinir Senha de Acesso</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Senha Atual</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Nova Senha Segura</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded transition-colors cursor-pointer"
                >
                  {isChangingPass ? 'Atualizando...' : 'Atualizar Senha Segura'}
                </button>
              </div>
            </form>
          </div>

          {/* RBAC Role Testing & Simulation Card */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm font-semibold text-white">Simulador dos 4 Níveis de Acesso (RBAC)</h3>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Alterne o perfil ativo para auditar em tempo real as restrições de tela e módulos da perfumaria:
            </p>

            <div className="space-y-1.5 pt-1">
              {(
                [
                  { role: 'SUPER_ADMIN', label: '1. Super Administrador', desc: '14 Módulos (Acesso Irrestrito)' },
                  { role: 'GERENTE', label: '2. Gerente de Perfumaria', desc: '10 Módulos (Catálogo, Vendas, Clientes)' },
                  { role: 'ESTOQUISTA', label: '3. Controle de Estoque', desc: '6 Módulos (Estoque, Entrada/Saída, Pedidos)' },
                  { role: 'CONSULTOR', label: '4. Consultor Olfativo VIP', desc: '6 Módulos (Atendimento, Agenda, Clientes)' },
                ] as const
              ).map((item) => {
                const isActive = currentAdmin?.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setTestingRole(item.role);
                      success(`Perfil alternado para ${item.role}. Permissões atualizadas no menu!`);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-zinc-500">{item.desc}</div>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold text-[9px] uppercase">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Authorized Admins & Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Authorized Admins List */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Operadores & Administradores Credenciados
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Usuários autorizados a operar os módulos da perfumaria
                </p>
              </div>

              {currentAdmin?.role === 'SUPER_ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Novo Operador</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {admins.map((adm) => {
                const isCurrent = adm.id === currentAdmin?.id;
                return (
                  <div
                    key={adm.id}
                    className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-bold">
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-200 flex items-center gap-2">
                          <span>{adm.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400">{adm.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="font-mono text-amber-300 font-medium block">
                          {adm.role}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {adm.lastLogin
                            ? `Último acesso: ${new Date(adm.lastLogin).toLocaleDateString('pt-BR')}`
                            : 'Nunca acessou'}
                        </span>
                      </div>

                      {!isCurrent && currentAdmin?.role === 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => setDeletingAdminId(adm.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          title="Remover Acesso do Operador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Audit Logs */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Trilha de Auditoria & Segurança do Sistema
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Últimas Ações</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-2">
                      <span className="text-amber-300">{log.action}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ({log.category})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{log.details}</p>
                    <span className="text-[10px] text-zinc-500">Operador: {log.adminName}</span>
                  </div>

                  <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE AUTHORIZED ADMIN MODAL */}
      <Modal
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        title="Cadastrar Administrador Autorizado"
        subtitle="Credenciamento de novo operador para o sistema da perfumaria"
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome Completo <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Ex: Carlos Mendonça"
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
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="carlos@maisonroyale.com.br"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Telefone</label>
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Cargo / Perfil de Acesso
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="GERENTE">Gerente de Perfumaria & Vendas</option>
                <option value="ESTOQUISTA">Controle de Estoque & Expedição</option>
                <option value="CONSULTOR">Consultor Olfativo / Atendimento</option>
                <option value="SUPER_ADMIN">Super Administrador (Acesso Irrestrito)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Senha Inicial de Acesso <span className="text-amber-400">*</span>
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1">
              Chave Mestre de Autorização
            </label>
            <input
              type="text"
              required
              value={regAuthKey}
              onChange={(e) => setRegAuthKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-500/30 rounded-lg text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddAdminOpen(false)}
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

      {/* DELETE ADMIN CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingAdminId}
        onClose={() => setDeletingAdminId(null)}
        onConfirm={confirmDeleteAdmin}
        title="Revogar Acesso do Operador"
        message="Tem certeza que deseja revogar o acesso deste administrador? Ele não conseguirá mais efetuar login no painel."
        confirmLabel="Sim, Revogar Acesso"
      />
    </div>
  );
};
