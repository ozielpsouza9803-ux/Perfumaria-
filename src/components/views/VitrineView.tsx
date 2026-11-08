import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Search,
  ArrowLeft,
  Layers
} from 'lucide-react';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { Product, Brand } from '../../types';
import { NavTab } from '../common/Sidebar';
import { useCart } from '../../context/CartContext';

interface VitrineViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenChat: () => void;
}

const VITRINE_BANNER_SLIDES = [
  {
    id: 1,
    title: 'Vitrine Oficial Maison Royale',
    subtitle: 'Acervo exclusivo de alta perfumaria com entrega assegurada e embalagem presenteável de colecionador.',
    image: LUXURY_PRESET_IMAGES[0].url,
    tag: 'Loja Virtual Oficial',
  },
  {
    id: 2,
    title: 'Fragrâncias Raras & Casas Parceiras',
    subtitle: 'Navegue entre criações internacionais e nacionais com selo de procedência real.',
    image: LUXURY_PRESET_IMAGES[1].url,
    tag: 'Seleção Privée',
  },
];

export const VitrineView: React.FC<VitrineViewProps> = ({ onNavigate }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('TODAS');
  const [activeFamily] = useState<string>('TODAS');

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
      setCurrentSlide((prev) => (prev + 1) % VITRINE_BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Filter products strictly by active status, search query, selected brand, and olfactory family
  const filteredProducts = products.filter((p) => {
    const isPublished = p.status === 'Ativo';
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brandName && p.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.olfactoryFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.concentration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrandId === 'TODAS' || p.brandId === selectedBrandId || p.brandName === selectedBrandId;
    const matchesFamily = activeFamily === 'TODAS' || p.olfactoryFamily === activeFamily;

    return isPublished && matchesSearch && matchesBrand && matchesFamily;
  });

  const showcaseItems = products.length > 0 ? products.slice(0, 6) : [
    { id: '1', name: 'Noir Oracle Extrait', brandName: 'House of Creed', salePrice: 1890, image: LUXURY_PRESET_IMAGES[0].url, concentration: 'Extrait de Parfum' },
    { id: '2', name: 'Oud Ambre Impérial', brandName: 'Amouage', salePrice: 2450, image: LUXURY_PRESET_IMAGES[1].url, concentration: 'Eau de Parfum' },
    { id: '3', name: 'Rêve de Rose & Ambre', brandName: 'Parfums de Marly', salePrice: 1680, image: LUXURY_PRESET_IMAGES[2].url, concentration: 'Extrait de Parfum' },
    { id: '4', name: 'Aurélia Blanche Haute', brandName: 'Maison Francis Kurkdjian', salePrice: 1450, image: LUXURY_PRESET_IMAGES[3].url, concentration: 'Eau de Parfum' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* 1. CABEÇALHO VITRINE: APENAS UM BOTÃO DISCRETO VOLTAR AO INÍCIO */}
      <div className="flex items-center justify-start pt-1 pb-1">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          title="Voltar à tela inicial"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Voltar ao Início</span>
        </button>
      </div>

      {/* 2. BANNER PROMOCIONAL VITRINE (CENTRALIZADO, VISUAL E TAMANHO ORIGINAIS RECUPERADOS) */}
      <section className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-amber-500/30 shadow-2xl">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full min-h-[300px] max-h-[400px] overflow-hidden">
          <img
            src={VITRINE_BANNER_SLIDES[currentSlide].image}
            alt={VITRINE_BANNER_SLIDES[currentSlide].title}
            className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />

          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-300 text-[10px] font-semibold uppercase tracking-widest w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{VITRINE_BANNER_SLIDES[currentSlide].tag}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-wide leading-tight">
              {VITRINE_BANNER_SLIDES[currentSlide].title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              {VITRINE_BANNER_SLIDES[currentSlide].subtitle}
            </p>
          </div>

          {/* Slider navigation indicator dots */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
            {VITRINE_BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === i ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-600'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARROSSEL DE PERFUMES 3D (LOGO ABAIXO DO BANNER) */}
      <section className="relative py-8 px-4 rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden">
        <div className="text-center space-y-2 mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Showcase Tridimensional 3D</span>
          </div>
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-white tracking-widest uppercase">
            Frascos Cinematográficos Flutuantes
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Publicidade imersiva em loop contínuo de alta perfumaria com profundidade e circulação tridimensional.
          </p>
        </div>

        <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center overflow-hidden [perspective:1200px]">
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

          <div className="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused] absolute whitespace-nowrap px-4">
            {[...showcaseItems, ...showcaseItems, ...showcaseItems].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-64 sm:w-72 shrink-0 rounded-2xl bg-zinc-900/95 border border-amber-500/40 hover:border-amber-400 p-4 transition-all cursor-pointer group shadow-2xl transform hover:-translate-y-2 hover:scale-105 duration-500 backdrop-blur-md"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.15)',
                }}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 relative border border-zinc-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                    {item.concentration || 'Extrait de Parfum'}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-amber-500 text-black font-bold text-[10px] px-2 py-0.5 rounded shadow">
                    Exclusivo 3D
                  </div>
                </div>

                <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider block truncate">
                  {item.brandName || 'Maison Royale'}
                </span>
                <h4 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 truncate mt-0.5">
                  {item.name}
                </h4>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    R$ {(item.salePrice || 1890).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item as Product);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FILTRO DE MARCAS & PESQUISA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedBrandId('TODAS')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedBrandId === 'TODAS'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
            }`}
          >
            Todas as Marcas
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBrandId(b.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedBrandId === b.id
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar por nome, marca ou família olfativa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-amber-500/30 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 5. LISTAGEM DE PRODUTOS NO FORMATO TRADICIONAL DE LOJA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            Catálogo de Fragrâncias ({filteredProducts.length})
          </h3>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="font-serif text-sm font-semibold text-zinc-300">Nenhum perfume encontrado.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-zinc-900/95 border border-zinc-800 hover:border-amber-500/40 p-3 flex flex-col justify-between shadow-lg group transition-all"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 relative border border-zinc-800">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                      {p.concentration || 'Eau de Parfum'}
                    </div>
                  </div>

                  <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider block truncate">
                    {p.brandName || 'Maison Royale'}
                  </span>
                  <h4 className="font-serif text-xs font-semibold text-white group-hover:text-amber-200 line-clamp-1 mt-0.5">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">
                    {p.olfactoryFamily}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    R$ {p.salePrice.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={p.stockQuantity === 0}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    {p.stockQuantity > 0 ? 'Comprar' : 'Esgotado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
