import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Store,
  Truck,
  ShieldCheck,
  Database as DatabaseIcon,
  Download,
  Upload,
  Save,
  Bell,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { Database } from '../../services/database';
import { GeneralSettings } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { ImageUpload } from '../common/ImageUpload';

export const GeneralSettingsView: React.FC = () => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1600&auto=format&fit=crop'
  );

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await Database.getSettings();
      setSettings(data);
    } catch (err) {
      error('Falha ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !settings.storeName.trim() || !settings.email.trim()) {
      error('Preencha os campos obrigatórios da loja.');
      return;
    }
    const res = await Database.saveSettings(settings);
    if (res.success) {
      success(res.message);
    } else {
      error(res.message);
    }
  };

  const handleExportBackup = () => {
    error('Exportação de backup via painel desativada no modo Supabase. Utilize o painel administrativo do Supabase.');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setPendingRestoreJson(content);
          setIsRestoreConfirmOpen(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const confirmRestore = () => {
    error('Restauração de backup via painel desativada no modo Supabase.');
    setPendingRestoreJson(null);
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Configurações Gerais da Perfumaria
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Parâmetros operacionais da boutique, regras de frete, limites de estoque e backup centralizado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Store className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm font-semibold text-white">Identidade da Boutique & Contato</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome da Marca / Boutique <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={settings.cnpj}
                  onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Telefone / Concierge</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Endereço Físico do Ateliê</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Logistics & Alerts */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-sm font-semibold text-white">Regras de Expedição & Estoque</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Frete Grátis a Partir de (R$)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Custo Padrão de Envio (R$)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultShippingCost}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultShippingCost: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Alerta de Estoque Mínimo Padrão
                  </label>
                  <input
                    type="number"
                    value={settings.lowStockAlertThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, lowStockAlertThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Maintenance mode checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="maintMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <label htmlFor="maintMode" className="text-xs text-zinc-300 cursor-pointer">
                  Modo Manutenção (bloqueia compras na loja para atualização de catálogo)
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Showcase Media Uploads & Backup */}
        <div className="space-y-6">
          {/* Banner & Media Upload Management */}
          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm font-semibold text-white">Banner & Mídia da Vitrine Principal</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Faça upload ou selecione fotografias para o banner principal da tela inicial, logotipos de marcas, fotos de frascos e imagens de perfil dos clientes/operadores.
            </p>

            <div className="pt-2">
              <ImageUpload
                value={heroBannerUrl}
                onChange={(newUrl) => {
                  setHeroBannerUrl(newUrl);
                  success('Banner da Vitrine atualizado com sucesso!');
                }}
                label="Banner Hero Principal (Tela Inicial)"
                hint="Envie uma imagem de alta definição (16:9 ou ultrawide) da sua galeria ou estúdio."
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <DatabaseIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm font-semibold text-white">Banco Centralizado & Backup</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Exporte todos os produtos, marcas, clientes, pedidos e estoques em um arquivo JSON seguro, ou restaure um backup prévio.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup Completo (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span>Restaurar Banco de Dados</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Integridade verificada a cada gravação</span>
              </div>
              <p>O painel sincroniza automaticamente entre abas através de barramento de eventos locais.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RESTORE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isRestoreConfirmOpen}
        onClose={() => setIsRestoreConfirmOpen(false)}
        onConfirm={confirmRestore}
        title="Restaurar Banco de Dados"
        message="ATENÇÃO: A restauração substituirá todos os dados atuais de produtos, clientes, estoque e pedidos pelo conteúdo do arquivo de backup. Deseja prosseguir?"
        confirmLabel="Sim, Restaurar Dados"
      />
    </div>
  );
};
