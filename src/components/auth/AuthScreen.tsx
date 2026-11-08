import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Lock, Mail, KeyRound, ShieldCheck, UserPlus, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, Send } from 'lucide-react';
import { AdminRole } from '../../types';
import { supabase } from '../../lib/supabase';

type AuthMode = 'LOGIN' | 'RECOVERY_REQUEST' | 'RECOVERY_RESET' | 'REGISTER_ADMIN' | 'REGISTER_CUSTOMER';

interface AuthScreenProps {
  onBackToStore?: () => void;
  onLoginSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBackToStore, onLoginSuccess }) => {
  const { login, requestPasswordRecovery, confirmPasswordReset, registerAuthorizedAdmin, registerCustomer } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('GERENTE');
  const [regPassword, setRegPassword] = useState('');
  const [regAuthKey, setRegAuthKey] = useState('');



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Preencha o e-mail e a senha.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        success(res.message);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        error(res.message);
        if (res.message.includes('não confirmado') || res.message.includes('confirmed')) {
          setNeedsConfirmation(true);
        }
      }
    } catch (err: any) {
      error(err?.message || 'Falha na conexão com o serviço de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      error('Informe o e-mail cadastrado para reenviar.');
      return;
    }
    setLoading(true);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (!resendErr) {
        success('Link de confirmação enviado para ' + email + '! Verifique seu e-mail.');
      } else {
        error(resendErr.message);
      }
    } catch (err: any) {
      error(err?.message || 'Erro ao enviar confirmação.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Informe o e-mail cadastrado do administrador.');
      return;
    }
    setLoading(true);
    const res = await requestPasswordRecovery(email);
    setLoading(false);
    if (res.success) {
      success('E-mail de recuperação enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.');
      setMode('LOGIN'); // Redirect to login, user will use the link in email
    } else {
      error(res.message);
    }
  };

  const handleRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || !newPassword) {
      error('Informe o código e a nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    // Note: Supabase handles recovery via magic link or email, not a custom code.
    // This part of the UI will need adjustment if not using magic link flow.
    // Assuming user wants to keep the existing UI flow for now.
    const res = await confirmPasswordReset(newPassword);
    setLoading(false);
    if (res.success) {
      success(res.message);
      setMode('LOGIN');
      setPassword(newPassword);
    } else {
      error(res.message);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regAuthKey) {
      error('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    const res = await registerAuthorizedAdmin(
      regName,
      regEmail,
      regRole,
      regPhone,
      regPassword,
      regAuthKey
    );
    setLoading(false);
    if (res.success) {
      success(res.message);
      setEmail(regEmail);
      setPassword(regPassword);
      setMode('LOGIN');
    } else {
      error(res.message);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      error('Preencha os campos obrigatórios.');
      return;
    }
    setLoading(true);
    const res = await registerCustomer(regName.trim(), regEmail.trim(), regPhone.trim(), regPassword.trim());
    setLoading(false);
    if (res.success) {
      success(res.message);
      setEmail(regEmail);
      setPassword(regPassword);
      setMode('LOGIN');
    } else {
      error(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black relative overflow-hidden">
      {/* Subtle gold ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-xl shadow-amber-500/5 mb-4 text-amber-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-widest uppercase font-bold">
            Maison Royale
          </h1>
          <p className="text-xs font-serif text-amber-400/90 tracking-widest mt-1">
            HAUTE PARFUMERIE · PORTAL ADMINISTRATIVO
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-px w-10 bg-amber-500/30"></span>
            <span className="text-[10px] text-zinc-500 tracking-wider uppercase">Ambiente Seguro</span>
            <span className="h-px w-10 bg-amber-500/30"></span>
          </div>

          {onBackToStore && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={onBackToStore}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para a Loja Pública</span>
              </button>
            </div>
          )}
        </div>

        {/* Card Box */}
        <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* MODE 1: LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Acesso Administrativo
                </h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">Senha Segura</label>
                  <button
                    type="button"
                    onClick={() => setMode('RECOVERY_REQUEST')}
                    className="text-xs text-amber-400/90 hover:text-amber-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {needsConfirmation && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                  <p className="leading-relaxed">
                    A conta de administrador requer confirmação de e-mail pelas diretrizes do Supabase. Verifique a caixa de entrada de <span className="font-semibold">{email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-black font-semibold text-[11px] rounded hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reenviar Link de Confirmação</span>
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Validando Credenciais...' : 'Acessar Painel ADM'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_CUSTOMER')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Criar Conta de Cliente VIP
                </button>
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_ADMIN')}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500/70" />
                  Cadastrar Operador / ADM Autorizado
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: RECOVERY REQUEST */}
          {mode === 'RECOVERY_REQUEST' && (
            <form onSubmit={handleRecoveryRequest} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Recuperação de Senha
                </h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Digite o e-mail cadastrado da sua conta de administrador. Enviaremos um código seguro de verificação.
              </p>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">E-mail do Administrador</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@maisonroyale.com.br"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-all"
              >
                {loading ? 'Gerando Código...' : 'Solicitar Código de Recuperação'}
              </button>
            </form>
          )}

          {/* MODE 3: RECOVERY RESET */}
          {mode === 'RECOVERY_RESET' && (
            <form onSubmit={handleRecoveryReset} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Redefinição Segura de Senha
                </h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Código de 6 Dígitos</label>
                <input
                  type="text"
                  required
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Ex: 849201"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nova Senha Segura</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirme a Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-all"
              >
                {loading ? 'Atualizando...' : 'Confirmar e Redefinir Senha'}
              </button>
            </form>
          )}

          {/* MODE 4: REGISTER AUTHORIZED ADMIN */}
          {mode === 'REGISTER_ADMIN' && (
            <form onSubmit={handleRegisterAdmin} className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                    Cadastro de Administrador
                  </h2>
                  <p className="text-[11px] text-zinc-400">Credenciamento de novo operador da perfumaria</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Carlos Mendonça"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">E-mail Corporativo</label>
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
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Cargo / Nível de Acesso</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="SUPER_ADMIN">Super Administrador (Acesso Irrestrito)</option>
                  <option value="GERENTE">Gerente de Perfumaria & Vendas</option>
                  <option value="ESTOQUISTA">Controle de Estoque & Expedição</option>
                  <option value="CONSULTOR">Consultor Olfativo / Atendimento</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-amber-300">Chave Mestre de Autorização</label>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regAuthKey}
                    onChange={(e) => setRegAuthKey(e.target.value)}
                    placeholder="Digite a chave de segurança"
                    className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-amber-500/30 rounded-lg text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-all mt-2"
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro ADM'}
              </button>
            </form>
          )}

          {/* MODE 5: REGISTER CUSTOMER */}
          {mode === 'REGISTER_CUSTOMER' && (
            <form onSubmit={handleCustomerRegister} className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                  Cadastro de Cliente VIP
                </h2>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs tracking-wider uppercase rounded-lg transition-all mt-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Criando Conta...' : 'Criar Conta de Cliente VIP'}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6 text-[11px] text-zinc-500 space-y-1">
          <p>© 2026 Maison Royale Parfumerie. Todos os direitos reservados.</p>
          <p className="text-zinc-600">Conexão criptografada de alta segurança SHA-256</p>
        </div>
      </div>
    </div>
  );
};
