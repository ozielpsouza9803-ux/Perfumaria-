import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gift,
  Calendar,
  ArrowRight,
  Droplets,
  Crown,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { Product, Brand } from '../../types';
import { NavTab } from '../common/Sidebar';
import { Modal } from '../common/Modal';
import { useCart } from '../../context/CartContext';

interface HomeVitrineViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenChat: () => void;
}

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    title: 'Maison Royale Haute Parfumerie',
    subtitle: 'A quintessência dos aromas raros, mestre perfumistas e frascos de cristal lapidado à mão com folha de ouro 24k.',
    image: LUXURY_PRESET_IMAGES[0].url,
    tag: 'Coleção Privée 2026',
  },
  {
    id: 2,
    title: 'Oud Ambre & Resinas Imperiais',
    subtitle: 'Extrações puríssimas de Agarwood de Assam e Incenso de Omã colhidos artesanalmente na Península Arábica.',
    image: LUXURY_PRESET_IMAGES[1].url,
    tag: 'Edição Numerada Rara',
  },
  {
    id: 3,
    title: 'Absoluto de Rosa Centifólia de Grasse',
    subtitle: 'Colheita manual ao alvorecer na Riviera Francesa com acabamento artesanal e selo real de procedência.',
    image: LUXURY_PRESET_IMAGES[2].url,
    tag: 'Ateliê Grasse Haute',
  },
];

export const HomeVitrineView: React.FC<HomeVitrineViewProps> = ({ onNavigate, onOpenChat }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamily, setActiveFamily] = useState<string>('TODAS');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const p = await Database.getProducts();
      const b = await Database.getBrands();
      setProducts(p);
      setBrands(b);
    };
    loadData();
    window.addEventListener('mr_database_change', loadData);
    return () => window.removeEventListener('mr_database_change', loadData);
  }, []);

  // Automatic hero slider transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Filter products by search query and olfactory family
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brandName && p.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.olfactoryFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.concentration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFamily = activeFamily === 'TODAS' || p.olfactoryFamily === activeFamily;

    return matchesSearch && matchesFamily;
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* 1. BANNER PRINCIPAL ANIMADO COM SUPORTE A IMAGENS E MÍDIA */}
      <section className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-amber-500/30 shadow-2xl group">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full min-h-[360px] max-h-[480px] overflow-hidden">
          <img
            src={DEFAULT_HERO_SLIDES[currentSlide].image}
            alt={DEFAULT_HERO_SLIDES[currentSlide].title}
            className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />

          {/* Hero Content */}
          <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-widest w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{DEFAULT_HERO_SLIDES[currentSlide].tag}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide leading-tight">
              {DEFAULT_HERO_SLIDES[currentSlide].title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {DEFAULT_HERO_SLIDES[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href="#vitrine-catalogo"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explorar Acervo Olfativo</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('agenda')}
                className="px-5 py-3 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-amber-300 border border-amber-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Atendimento Private</span>
              </button>
            </div>
          </div>

          {/* Slider controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? DEFAULT_HERO_SLIDES.length - 1 : prev - 1))}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {DEFAULT_HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === i ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-600'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % DEFAULT_HERO_SLIDES.length)}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. NOME E IDENTIDADE MAISON ROYALE */}
      <section className="text-center space-y-2 py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Haute Parfumerie Paris · Jardins SP</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-widest uppercase">
          Maison Royale
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Curadoria exclusiva dos mais raros extraits de parfum, essências naturais puras e criações olfativas dos maiores meste-perfumistas do mundo.
        </p>
      </section>

      {/* 3. CARROSSEL HORIZONTAL DE PERFUMES EM MOVIMENTO CONTÍNUO (INFINITE MARQUEE) */}
      <section className="space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Destaques Olfativos em Movimento Contínuo
          </h3>
          <span className="text-[10px] text-amber-400/80 uppercase tracking-widest">Loop Infinito</span>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 p-4 border border-zinc-800/80">
          <div className="flex items-center gap-4 animate-marquee hover:[animation-play-state:paused]">
            {[...products, ...products].map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                onClick={() => setViewingProduct(p)}
                className="w-56 shrink-0 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 p-3 transition-all cursor-pointer group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-950 mb-2 relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                    {p.concentration}
                  </div>
                </div>

                <span className="text-[9px] text-amber-400 font-medium uppercase tracking-wider block truncate">
                  {p.brandName}
                </span>
                <h4 className="font-serif text-xs font-semibold text-white group-hover:text-amber-200 truncate">
                  {p.name}
                </h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    R$ {p.salePrice.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                    }}
                    className="px-2 py-1 bg-amber-500 text-black font-bold text-[10px] rounded hover:bg-amber-400 transition-colors"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BARRA DE PESQUISA DE PRODUTOS */}
      <section id="vitrine-catalogo" className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-amber-400" />
              Catálogo Geral & Vitrine de Perfumes
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Busque por nome do perfume, casa olfativa, notas ou família olfativa.
            </p>
          </div>

          {/* Search Input & Voltar ao Início Button */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Retornar à página principal da Maison Royale"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Voltar ao Início</span>
            </button>

            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Pesquisar perfume, marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Olfactory Family Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['TODAS', 'Amadeirado', 'Oriental & Âmbar', 'Floral Nobre', 'Cítrico & Fresco', 'Chipre Frutado', 'Gourmand'].map((fam) => (
            <button
              key={fam}
              type="button"
              onClick={() => setActiveFamily(fam)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFamily === fam
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {fam}
            </button>
          ))}
        </div>

        {/* 5. GRADE DE PRODUTOS COM DISPONIBILIDADE E 6. BOTÃO COMPRAR */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <Search className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="font-serif text-sm font-semibold text-zinc-300">Nenhum perfume encontrado</h3>
            <p className="text-xs text-zinc-500">Tente buscar por outros termos ou selecione "TODAS" as famílias.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const inStock = p.stockQuantity > 0;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
                >
                  <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Concentration tag */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                      {p.concentration}
                    </div>

                    {/* Stock indicator badge */}
                    <div className="absolute top-2 right-2">
                      {inStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {p.stockQuantity <= p.minStockAlert ? 'Últimas Unidades' : 'Em Estoque'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Esgotado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block">
                        {p.brandName}
                      </span>
                      <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1 mt-0.5">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 block uppercase">Valor</span>
                        <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                          R$ {p.salePrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingProduct(p)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ficha</span>
                        </button>

                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() => addToCart(p)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>COMPRAR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* VIEW FICHA OLFATIVA MODAL */}
      {viewingProduct && (
        <Modal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={viewingProduct.name}
          subtitle={`Ficha Técnica Oficial · SKU ${viewingProduct.sku}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-4/3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Casa Olfativa:</span>
                    <span className="text-zinc-200 font-medium">{viewingProduct.brandName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Concentração:</span>
                    <span className="text-amber-300 font-semibold">{viewingProduct.concentration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Família Olfativa:</span>
                    <span className="text-zinc-200 font-medium">{viewingProduct.olfactoryFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Volume Frasco:</span>
                    <span className="font-mono text-zinc-200">{viewingProduct.volumeMl}ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Disponibilidade:</span>
                    <span className="text-emerald-400 font-semibold">
                      {viewingProduct.stockQuantity} unidades em estoque
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500">Preço de Venda:</span>
                    <span className="font-mono text-amber-300 font-bold text-sm">
                      R$ {viewingProduct.salePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pyramid */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-amber-500/30 space-y-3">
              <div className="text-xs font-serif font-semibold text-amber-300 uppercase tracking-wider text-center">
                Pirâmide Olfativa Mestra
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Topo / Saída
                  </span>
                  <span className="text-zinc-200">{viewingProduct.topNotes || 'Essências cítricas e resinas'}</span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Coração / Corpo
                  </span>
                  <span className="text-zinc-200">{viewingProduct.heartNotes || 'Flores de Grasse e acordes florais'}</span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Fundo / Base
                  </span>
                  <span className="text-zinc-200">{viewingProduct.baseNotes || 'Oud raro, sândalo e âmbar cinzento'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(viewingProduct);
                  setViewingProduct(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar à Sacola (R$ {viewingProduct.salePrice.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
