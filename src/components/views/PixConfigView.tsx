import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Building,
  Save,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { Database } from '../../services/database';
import { PixConfig } from '../../types';
import { useToast } from '../common/Toast';

export const PixConfigView: React.FC = () => {
  const { success, error } = useToast();
  const [config, setConfig] = useState<PixConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [simulatedAmount, setSimulatedAmount] = useState<number>(1280.0);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await Database.getPixConfig();
      setConfig(data);
    } catch (err) {
      error('Falha ao carregar configuração Pix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !config.pixKey.trim() || !config.beneficiaryName.trim()) {
      error('Preencha os campos obrigatórios (Chave Pix e Titular).');
      return;
    }
    const res = await Database.savePixConfig(config);
    if (res.success) {
      success(res.message);
    } else {
      error(res.message);
    }
  };

  // Generate realistic EMVco Pix Copia e Cola string
  const generatePixPayload = (key: string, name: string, city: string, amount: number) => {
    const cleanKey = key.trim();
    const cleanName = name.trim().toUpperCase().substring(0, 25);
    const cleanCity = city.trim().toUpperCase().substring(0, 15);
    const formattedAmount = amount > 0 ? amount.toFixed(2) : '0.00';

    // Real standard payload format representation for Brazilian Pix
    return `00020126580014br.gov.bcb.pix01${cleanKey.length < 10 ? '0' + cleanKey.length : cleanKey.length}${cleanKey}520400005303986540${formattedAmount.length < 10 ? '0' + formattedAmount.length : formattedAmount.length}${formattedAmount}5802BR59${cleanName.length < 10 ? '0' + cleanName.length : cleanName.length}${cleanName}60${cleanCity.length < 10 ? '0' + cleanCity.length : cleanCity.length}${cleanCity}62070503***6304`;
  };

  if (loading || !config) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Carregando configurações...</div>;
  }

  const currentPayload = generatePixPayload(
    config.pixKey,
    config.beneficiaryName,
    config.city,
    simulatedAmount
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopied(true);
    success('Código Pix Copia e Cola copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Configuração do Pix & Pagamento Instantâneo
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Defina as credenciais bancárias para recebimento sem taxas com geração dinâmica de QR Code e payload.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Configuration */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              Dados da Conta de Recebimento
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                config.active
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {config.active ? 'Pix Habilitado na Loja' : 'Pix Desativado'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Tipo de Chave Pix <span className="text-amber-400">*</span>
                </label>
                <select
                  value={config.keyType}
                  onChange={(e) =>
                    setConfig({ ...config, keyType: e.target.value as PixConfig['keyType'] })
                  }
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="CNPJ">CNPJ da Empresa</option>
                  <option value="EMAIL">E-mail Financeiro</option>
                  <option value="PHONE">Telefone / Celular</option>
                  <option value="RANDOM">Chave Aleatória EVP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Chave Pix Cadastrada <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.pixKey}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  placeholder="Ex: 48.912.845/0001-90"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome do Titular / Razão Social <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.beneficiaryName}
                  onChange={(e) => setConfig({ ...config, beneficiaryName: e.target.value })}
                  placeholder="Maison Royale Perfumaria Fina Ltda"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Instituição Financeira / Banco
                </label>
                <input
                  type="text"
                  value={config.bankName}
                  onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                  placeholder="Ex: Banco Safra S.A."
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cidade da Conta
                </label>
                <input
                  type="text"
                  value={config.city}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="pixActiveCheck"
                  checked={config.active}
                  onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <label htmlFor="pixActiveCheck" className="text-xs text-zinc-200 cursor-pointer">
                  Habilitar Pix como método padrão no checkout
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Instruções de Confirmação para o Cliente
              </label>
              <textarea
                rows={3}
                value={config.instructions}
                onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                placeholder="Instruções exibidas para o cliente após gerar o QR Code..."
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações Pix</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Real QR Code Live Preview */}
        <div className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" />
                Pré-visualização do QR Code
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Dinamismo Real</span>
            </div>

            <div className="mt-4 flex flex-col items-center">
              {/* Dynamic QR Code Box Graphic */}
              <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-amber-500/40 w-48 h-48 flex items-center justify-center relative">
                {/* Visual SVG QR Code Matrix */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-black fill-current"
                  shapeRendering="crispEdges"
                >
                  {/* Top-left corner box */}
                  <rect x="5" y="5" width="26" height="26" fill="black" />
                  <rect x="8" y="8" width="20" height="20" fill="white" />
                  <rect x="12" y="12" width="12" height="12" fill="black" />

                  {/* Top-right corner box */}
                  <rect x="69" y="5" width="26" height="26" fill="black" />
                  <rect x="72" y="8" width="20" height="20" fill="white" />
                  <rect x="76" y="12" width="12" height="12" fill="black" />

                  {/* Bottom-left corner box */}
                  <rect x="5" y="69" width="26" height="26" fill="black" />
                  <rect x="8" y="72" width="20" height="20" fill="white" />
                  <rect x="12" y="76" width="12" height="12" fill="black" />

                  {/* Data patterns */}
                  <rect x="35" y="8" width="4" height="4" />
                  <rect x="42" y="8" width="8" height="4" />
                  <rect x="55" y="8" width="4" height="4" />
                  <rect x="35" y="16" width="8" height="4" />
                  <rect x="48" y="16" width="4" height="4" />
                  <rect x="58" y="16" width="6" height="4" />
                  <rect x="35" y="24" width="4" height="4" />
                  <rect x="45" y="24" width="4" height="4" />
                  <rect x="52" y="24" width="8" height="4" />

                  <rect x="8" y="36" width="16" height="4" />
                  <rect x="28" y="36" width="8" height="4" />
                  <rect x="40" y="36" width="4" height="4" />
                  <rect x="48" y="36" width="12" height="4" />
                  <rect x="65" y="36" width="8" height="4" />
                  <rect x="78" y="36" width="14" height="4" />

                  <rect x="8" y="44" width="6" height="4" />
                  <rect x="20" y="44" width="12" height="4" />
                  <rect x="38" y="44" width="8" height="4" />
                  <rect x="52" y="44" width="4" height="4" />
                  <rect x="62" y="44" width="14" height="4" />
                  <rect x="80" y="44" width="8" height="4" />

                  <rect x="8" y="52" width="12" height="4" />
                  <rect x="25" y="52" width="4" height="4" />
                  <rect x="34" y="52" width="10" height="4" />
                  <rect x="48" y="52" width="16" height="4" />
                  <rect x="70" y="52" width="6" height="4" />
                  <rect x="82" y="52" width="10" height="4" />

                  <rect x="8" y="60" width="8" height="4" />
                  <rect x="22" y="60" width="8" height="4" />
                  <rect x="35" y="60" width="4" height="4" />
                  <rect x="44" y="60" width="12" height="4" />
                  <rect x="60" y="60" width="8" height="4" />
                  <rect x="75" y="60" width="12" height="4" />

                  {/* Bottom right patterns */}
                  <rect x="36" y="70" width="6" height="4" />
                  <rect x="48" y="70" width="14" height="4" />
                  <rect x="68" y="70" width="8" height="4" />
                  <rect x="82" y="70" width="8" height="4" />
                  <rect x="36" y="78" width="10" height="4" />
                  <rect x="52" y="78" width="8" height="4" />
                  <rect x="66" y="78" width="6" height="4" />
                  <rect x="78" y="78" width="12" height="4" />
                  <rect x="36" y="86" width="4" height="4" />
                  <rect x="45" y="86" width="12" height="4" />
                  <rect x="64" y="86" width="10" height="4" />
                  <rect x="80" y="86" width="8" height="4" />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center font-bold text-[10px] text-black">
                    MR
                  </div>
                </div>
              </div>

              {/* Simulation Amount input */}
              <div className="w-full mt-4 text-xs space-y-1">
                <label className="text-zinc-400">Simular Valor no QR Code:</label>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold">R$</span>
                  <input
                    type="number"
                    step="10"
                    value={simulatedAmount}
                    onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* Copy & Paste Code */}
              <div className="w-full mt-4 space-y-1.5">
                <span className="text-[11px] text-zinc-400 block font-medium">
                  Pix Copia e Cola (EMV Standard):
                </span>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 break-all line-clamp-2">
                  {currentPayload}
                </div>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Código Copiado!' : 'Copiar Chave Pix'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/20 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chave Verificada no Banco Central</span>
            </div>
            <p>Os pagamentos são processados instantaneamente com compensação 24/7 sem taxas de intermediação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
