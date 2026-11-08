import React, { useState } from 'react';
import {
  Package,
  Award,
  Layers,
  Sparkles,
  Droplets,
  Plus,
} from 'lucide-react';
import { ProductsView } from './ProductsView';
import { BrandsView } from './BrandsView';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { OlfactoryFamily, FragranceConcentration } from '../../types';

export type ProdutosSubTab = 'perfumes' | 'marcas' | 'categorias' | 'galeria';

interface ProdutosModuloViewProps {
  initialSubTab?: ProdutosSubTab;
}

const OLFACTORY_FAMILIES_INFO: {
  family: OlfactoryFamily;
  origin: string;
  description: string;
  keyNotes: string;
}[] = [
  {
    family: 'Amadeirado',
    origin: 'Tradição Nobre & Resinas',
    description: 'Composições calorosas, secas e opulentas centradas em madeiras nobres, cedro, sândalo e agarwood.',
    keyNotes: 'Cedro do Atlas, Sândalo de Mysore, Vetiver, Patchouli, Agarwood selvagem',
  },
  {
    family: 'Oriental & Âmbar',
    origin: 'Corte Imperial & Sultões',
    description: 'Fragrâncias voluptuosas e aveludadas com acordes resinosos, baunilhas exóticas e bálsamos sagrados.',
    keyNotes: 'Âmbar resinoso, Baunilha Bourbon, Fava Tonka, Mirra, Olíbano de Omã',
  },
  {
    family: 'Floral Nobre',
    origin: 'Grasse & Côte d’Azur',
    description: 'A quintessência das pétalas raras colhidas ao alvorecer para extração de absolutos puríssimos.',
    keyNotes: 'Rosa Centifólia de Grasse, Jasmim Grandiflorum, Tuberosa da Índia, Íris de Florença',
  },
  {
    family: 'Cítrico & Fresco',
    origin: 'Mediterrâneo & Riviera',
    description: 'Frescor aristocrático luminoso obtido por prensagem a frio de cascas de cítricos solares da Itália.',
    keyNotes: 'Bergamota da Calábria, Cidra Siciliana, Néroli, Mandarina Real, Petitgrain',
  },
  {
    family: 'Chipre Frutado',
    origin: 'Alta Perfumaria Clássica',
    description: 'O contraste sofisticado entre um acorde cítrico cintilante e uma base profunda de musgo de carvalho.',
    keyNotes: 'Musgo de Carvalho, Bergamota, Pêssego Nobre, Cistus Labdanum, Patchouli',
  },
  {
    family: 'Gourmand',
    origin: 'Ateliê Doce Contemporâneo',
    description: 'Fragrâncias viciantes e sofisticadas inspiradas na alta confeitaria francesa e grãos tostados.',
    keyNotes: 'Pralinê, Chocolate Negro 85%, Caramelo Salgado da Bretanha, Amêndoas de Avola',
  },
  {
    family: 'Couro & Tabaco',
    origin: 'Clubes Privados & Bibliotecas',
    description: 'Aconchegante e imponente, evocando estofados de couro toscano, charutos cubanos e conhaque envelhecido.',
    keyNotes: 'Couro da Toscana, Folhas de Tabaco Havana, Madeira Queimada, Castoreum vegetal',
  },
];

const CONCENTRATIONS_INFO: {
  title: FragranceConcentration;
  oilPercentage: string;
  longevity: string;
  usage: string;
}[] = [
  {
    title: 'Extrait de Parfum',
    oilPercentage: '30% a 40% de essência pura',
    longevity: 'Mais de 24 horas na pele',
    usage: 'Aplicação por gotas em pontos de pulsação; máxima nobreza olfativa.',
  },
  {
    title: 'Eau de Parfum',
    oilPercentage: '18% a 25% de óleos essenciais',
    longevity: '12 a 16 horas de projeção',
    usage: 'Uso diário refinado e ocasiões de destaque social.',
  },
  {
    title: 'Eau de Toilette',
    oilPercentage: '10% a 15% de essência',
    longevity: '6 a 8 horas',
    usage: 'Climas quentes, frescor matinal e ocasiões casuais de luxo.',
  },
  {
    title: 'Eau de Cologne',
    oilPercentage: '5% a 8% de óleos cítricos',
    longevity: '3 a 5 horas',
    usage: 'Renovação e bem-estar aromático ao longo do dia.',
  },
  {
    title: 'Attar Puro',
    oilPercentage: '100% óleo aromático sem álcool',
    longevity: 'Até 48 horas de silagem íntima',
    usage: 'Tradição do Oriente Médio em frasco de cristal com bastão de vidro.',
  },
];

export const ProdutosModuloView: React.FC<ProdutosModuloViewProps> = ({ initialSubTab = 'perfumes' }) => {
  const [activeTab, setActiveTab] = useState<ProdutosSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Módulo 3: Catálogo, Fragrâncias & Marcas
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gestão completa do acervo de perfumes da Maison Royale, casas parceiras, pirâmides olfativas e fotografia de estúdio.
        </p>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('perfumes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'perfumes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Cadastro de Perfumes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('marcas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'marcas'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Marcas & Casas Olfativas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categorias')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'categorias'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Famílias & Concentrações</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('galeria')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'galeria'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Fotos & Pirâmides Olfativas</span>
        </button>
      </div>

      {/* Tab 1: PERFUMES (re-uses existing robust ProductsView) */}
      {activeTab === 'perfumes' && <ProductsView />}

      {/* Tab 2: MARCAS (re-uses existing robust BrandsView) */}
      {activeTab === 'marcas' && <BrandsView />}

      {/* Tab 3: CATEGORIAS & FRAGRÂNCIAS */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-amber-400" />
              As 7 Famílias Olfativas da Alta Perfumaria
            </h3>
            <p className="text-xs text-zinc-400">
              Classificação genealógica oficial empregada pela Maison Royale para curadoria sensorial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OLFACTORY_FAMILIES_INFO.map((f) => (
              <div
                key={f.family}
                className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-sm font-bold text-amber-300">{f.family}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">{f.origin}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{f.description}</p>
                <div className="pt-2 border-t border-zinc-800 text-[11px]">
                  <span className="text-zinc-500 block mb-0.5">Notas Chave:</span>
                  <span className="text-zinc-400 font-medium">{f.keyNotes}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 mt-6">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              Concentrações & Teores de Óleos Essenciais
            </h3>
            <p className="text-xs text-zinc-400">
              Escala de fixação, intensidade de silagem e tempo de projeção cutânea.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONCENTRATIONS_INFO.map((c) => (
              <div
                key={c.title}
                className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs"
              >
                <div className="font-serif text-sm font-semibold text-white">{c.title}</div>
                <div className="text-amber-400 font-mono font-medium text-[11px]">
                  {c.oilPercentage}
                </div>
                <div className="text-zinc-400 text-[11px]">Fixação: {c.longevity}</div>
                <div className="text-zinc-500 text-[11px] pt-2 border-t border-zinc-800">
                  {c.usage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: FOTOS & PIRÂMIDES OLFATIVAS */}
      {activeTab === 'galeria' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Galeria de Frascos & Acordos de Alta Definição
            </h3>
            <p className="text-xs text-zinc-400">
              Fotografias oficiais de estúdio e pirâmides tridimensionais de fragrâncias de assinatura.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LUXURY_PRESET_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden group"
              >
                <div className="aspect-4/3 bg-zinc-950 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-serif text-xs font-semibold text-white truncate">{img.name}</h4>
                  <span className="text-[10px] text-amber-400/80 block mt-0.5">Estúdio Maison Royale</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
