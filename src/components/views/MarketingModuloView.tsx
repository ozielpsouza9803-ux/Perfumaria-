import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  Crown,
  Gift,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CouponsView } from './CouponsView';

export type MarketingSubTab = 'cupons' | 'promocoes' | 'vip';

interface MarketingModuloViewProps {
  initialSubTab?: MarketingSubTab;
}

const CAMPAIGNS_DATA = [
  {
    id: 'camp_01',
    title: 'Semana de Gala — L’Or de Grasse',
    subtitle: 'Brinde exclusivo de miniatura 10ml de extrait em compras acima de R$ 2.500',
    validity: 'Válido até 30/11/2026',
    status: 'Ativa',
    badge: 'Campanha Boutique Flagship',
    highlight: 'Fragrância Brinde: Rose Velours Extrait',
  },
  {
    id: 'camp_02',
    title: 'Noite de Degustação Privée — Diamond Club',
    subtitle: 'Encontro com o Master Perfumer e degustação de óleos raros de Agarwood',
    validity: 'Evento em 18/11/2026',
    status: 'Exclusivo VIP',
    badge: 'Somente Membros Diamond',
    highlight: '12 Convidados VIP Confirmados',
  },
  {
    id: 'camp_03',
    title: 'Gravação Personalizada em Latão & Ouro 24k',
    subtitle: 'Personalização cortesia das iniciais do cliente no frasco de cristal para presentes',
    validity: 'Válido o ano todo',
    status: 'Ativa',
    badge: 'Serviço Ateliê',
    highlight: 'Disponível em todos os Extrait de Parfum',
  },
];

const VIP_TIERS_DATA = [
  {
    tier: 'Diamond Club',
    spending: 'A partir de R$ 5.000 em compras acumuladas',
    color: 'from-amber-400 to-amber-200 text-black',
    benefits: [
      'Concierge olfativo dedicado 24/7',
      'Frete aéreo cortesia em todas as encomendas com seguro total',
      'Convites prioritários para lançamentos de edições limitadas numeradas',
      'Atendimento privativo na Sala Real da Boutique Flagship',
      'Miniaturas colecionáveis de 10ml em todo pedido',
    ],
  },
  {
    tier: 'Gold VIP',
    spending: 'De R$ 2.000 a R$ 4.999 em compras acumuladas',
    color: 'from-amber-600 to-amber-400 text-black',
    benefits: [
      'Consultoria olfativa semestral cortesia com especialista',
      'Acesso antecipado a reabastecimentos de frascos raros',
      'Frete grátis nacional em pedidos acima de R$ 300',
      'Embalagem para presente em veludo negro bordado em fio dourado',
    ],
  },
  {
    tier: 'Standard VIP',
    spending: 'Todos os clientes cadastrados no ateliê',
    color: 'from-zinc-800 to-zinc-700 text-zinc-200',
    benefits: [
      'Pontuação e histórico sensorial catalogado',
      'Avisos de novos lotes e reposições de estoque',
      'Atendimento prioritário na boutique física e digital',
    ],
  },
];

export const MarketingModuloView: React.FC<MarketingModuloViewProps> = ({
  initialSubTab = 'cupons',
}) => {
  const [activeTab, setActiveTab] = useState<MarketingSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Módulo 7: Marketing, Cupons & Experiências VIP
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gestão de códigos de desconto, campanhas promocionais de prestígio e programas de fidelidade Diamond e Gold VIP.
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'cupons'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupons de Desconto & Vouchers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promocoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'promocoes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Campanhas & Promoções</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vip')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'vip'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Clubes & Benefícios VIP</span>
        </button>
      </div>

      {/* TAB 1: CUPONS */}
      {activeTab === 'cupons' && <CouponsView />}

      {/* TAB 2: PROMOÇÕES */}
      {activeTab === 'promocoes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPAIGNS_DATA.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {c.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors mt-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{c.subtitle}</p>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-500 block text-[10px]">Destaque:</span>
                    <span className="font-medium text-amber-300">{c.highlight}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.validity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENTES VIP */}
      {activeTab === 'vip' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VIP_TIERS_DATA.map((t) => (
              <div
                key={t.tier}
                className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      {t.tier}
                    </h3>
                  </div>

                  <p className="text-xs text-amber-300/90 font-mono mt-2 mb-4">{t.spending}</p>

                  <div className="space-y-2.5 text-xs text-zinc-300">
                    {t.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
