import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Search,
  ArrowLeft,
  Check,
  Crown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Filter
} from 'lucide-react';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { Product, Brand } from '../../types';
import { NavTab } from '../common/Sidebar';
import { useCart } from '../../context/CartContext';

import brandCreedImg from '../../assets/images/brand_creed_1794159680424.jpg';
import brandMarlyImg from '../../assets/images/brand_marly_1794159681220.jpg';
import brandAmouageImg from '../../assets/images/brand_amouage_1794159681801.jpg';
import brandMfkImg from '../../assets/images/brand_mfk_1794159695994.jpg';

const BRAND_IMAGE_MAP: Record<string, { image: string; tag: string; description: string }> = {
  'House of Creed': {
    image: brandCreedImg,
    tag: 'Haute Parfumerie · 1760',
    description: 'Fragrâncias régias e sofisticação histórica da nobreza europeia.',
  },
  'Parfums de Marly': {
    image: brandMarlyImg,
    tag: 'Château de Marly · XVIII',
    description: 'Estética aristocrática e o fausto dos perfumes da corte francesa.',
  },
  'Amouage': {
    image: brandAmouageImg,
    tag: 'Sultanato de Omã',
    description: 'O luxo oriental supremo em extrações puríssimas e incenso real.',
  },
  'Maison Francis Kurkdjian': {
    image: brandMfkImg,
    tag: 'Paris · Contemporâneo',
    description: 'Alta perfumaria moderna francesa de extrema elegância e brilho.',
  },
};

interface VitrineViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenChat: () => void;
}

const VITRINE_BANNER_SLIDES = [
  {
    id: 1,
    title: 'Fragrâncias Raras & Casas Parceiras',
    subtitle: 'Acervo exclusivo de alta perfumaria com entrega assegurada, frascos lacrados e embalagem presenteável de colecionador.',
    image: LUXURY_PRESET_IMAGES[1].url,
    tag: 'Seleção Privée 2026',
  },
  {
    id: 2,
    title: 'Vitrine Oficial Maison Royale',
    subtitle: 'Curadoria mundial de criações internacionais e nacionais com selo de procedência real.',
    image: LUXURY_PRESET_IMAGES[0].url,
    tag: 'Loja Virtual Oficial',
  },
];

// Progressive image with instant skeleton and zero-blocking fade-in
const ProgressiveProductImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setImgSrc(LUXURY_PRESET_IMAGES[0].url);
          setLoaded(true);
        }}
        className={`${className || ''} w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export const VitrineView: React.FC<VitrineViewProps> = ({ onNavigate, onOpenChat }) => {
  const { addToCart } = useCart();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Shared instant data source from cache; zero lag on tab switch
  const [products, setProducts] = useState<Product[]>(() => Database.getCachedProductsSync());
  const [brands, setBrands] = useState<Brand[]>(() => Database.getCachedBrandsSync());
  const [isLoading, setIsLoading] = useState<boolean>(products.length === 0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('TODAS');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [p, b] = await Promise.all([
          Database.getProducts(),
          Database.getBrands(),
        ]);
        if (isMounted) {
          setProducts(p);
          setBrands(b);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    window.addEventListener('mr_database_change', loadData);
    return () => {
      isMounted = false;
      window.removeEventListener('mr_database_change', loadData);
    };
  }, []);

  // Automatic banner transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % VITRINE_BANNER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Selected brand object or name
  const selectedBrandObj = brands.find((b) => b.id === selectedBrandId || b.name === selectedBrandId);

  // Base products for active brand filter (without artificial limit)
  const brandProducts = products.filter((p) => {
    const isPublished = p.status === 'Ativo';
    if (!isPublished) return false;
    if (selectedBrandId === 'TODAS') return true;
    return (
      p.brandId === selectedBrandId ||
      p.brandName === selectedBrandId ||
      (selectedBrandObj && p.brandName === selectedBrandObj.name)
    );
  });

  // Final filtered list including search query
  const filteredProducts = brandProducts.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      (p.brandName && p.brandName.toLowerCase().includes(query)) ||
      p.olfactoryFamily.toLowerCase().includes(query) ||
      p.concentration.toLowerCase().includes(query)
    );
  });

  // Items for the 3D horizontal carousel (uses brand products or fallback items)
  const carouselItems = brandProducts.length > 0 ? brandProducts : Database.INITIAL_PRODUCTS;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1500);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-28 px-2 sm:px-4">
      {/* 1. CABEÇALHO VITRINE: APENAS UM BOTÃO DISCRETO VOLTAR AO INÍCIO */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          title="Voltar à tela inicial"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="font-serif text-xs text-amber-300 font-bold uppercase tracking-wider hidden sm:inline">
            Vitrine Haute Parfumerie
          </span>
        </div>
      </div>

      {/* 2. BANNER PRINCIPAL EXPANDIDO DA VITRINE */}
      <section className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-amber-500/35 shadow-2xl group">
        <div className="relative aspect-[16/8] sm:aspect-[21/8] md:aspect-[25/8] w-full min-h-[260px] sm:min-h-[340px] lg:min-h-[380px] max-h-[440px] overflow-hidden">
          <img
            src={VITRINE_BANNER_SLIDES[currentSlide].image}
            alt={VITRINE_BANNER_SLIDES[currentSlide].title}
            className="w-full h-full object-cover object-center transition-all duration-1000 scale-105 group-hover:scale-100"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />

          {/* Vignette border framing */}
          <div className="absolute inset-0 border border-amber-500/20 rounded-3xl pointer-events-none" />

          <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end max-w-3xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-widest w-fit shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{VITRINE_BANNER_SLIDES[currentSlide].tag}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide leading-tight drop-shadow-md">
              {VITRINE_BANNER_SLIDES[currentSlide].title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              {VITRINE_BANNER_SLIDES[currentSlide].subtitle}
            </p>
          </div>

          {/* Slider controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? VITRINE_BANNER_SLIDES.length - 1 : prev - 1))}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
              aria-label="Slide Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
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

            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % VITRINE_BANNER_SLIDES.length)}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
              aria-label="Próximo Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CARTÕES MINIATURA DAS MARCAS (ABAS COMPACTAS) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            AS MARCAS & CASAS OLFATIVAS
          </h3>

          <button
            type="button"
            onClick={() => setSelectedBrandId('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
              selectedBrandId === 'TODAS'
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todas as Marcas</span>
          </button>
        </div>

        {/* Grade de Miniaturas Compactas de Marcas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {brands.map((brand) => {
            const info = BRAND_IMAGE_MAP[brand.name] || {
              image: LUXURY_PRESET_IMAGES[0].url,
              tag: brand.country,
              description: brand.description,
            };
            const isSelected = selectedBrandId === brand.id || selectedBrandId === brand.name;

            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSelectedBrandId(isSelected ? 'TODAS' : brand.id)}
                className={`group flex items-center gap-3 p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer border text-left ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/60 shadow-lg shadow-amber-500/15'
                    : 'bg-zinc-900/95 border-amber-500/30 hover:border-amber-400 hover:bg-zinc-900'
                }`}
              >
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-amber-500/40 bg-zinc-950 shadow-sm">
                  <img
                    src={info.image}
                    alt={brand.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-xs font-bold text-white group-hover:text-amber-200 truncate leading-snug">
                    {brand.name}
                  </h4>
                  <span className="text-[10px] text-amber-400/90 font-mono uppercase tracking-wider block truncate mt-0.5">
                    {brand.country.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. BARRA DE PESQUISA (POSICIONADA IMEDIATAMENTE ABAIXO DAS MARCAS) */}
      <section className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3" />
          <input
            type="text"
            placeholder={
              selectedBrandId !== 'TODAS' && selectedBrandObj
                ? `Pesquisar perfumaria da marca ${selectedBrandObj.name}...`
                : 'Pesquisar fragrâncias por nome, casa olfativa ou notas...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-zinc-900/90 border border-amber-500/35 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
          />
        </div>
      </section>

      {/* 5. CARROSSEL HORIZONTAL 3D DE FRASCOS (MARCA SELECIONADA OU VISÃO GERAL) */}
      <section className="relative py-6 px-3.5 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/35 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {selectedBrandId !== 'TODAS' && selectedBrandObj
                  ? `Coleção Exclusiva 3D — ${selectedBrandObj.name}`
                  : 'Destaques 3D de Alta Perfumaria'}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Navegue entre os frascos em exposição tridimensional ({carouselItems.length} itens)
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer shadow"
              title="Rolar Carrossel para Esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer shadow"
              title="Rolar Carrossel para Direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Carousel Stage */}
        <div className="relative w-full min-h-[300px] flex items-center overflow-hidden [perspective:1200px]">
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse left-1/2 -translate-x-1/2" />

          <div
            ref={carouselRef}
            className="flex items-center gap-5 overflow-x-auto scroll-smooth scrollbar-none py-4 px-2 w-full"
            style={{
              scrollSnapType: 'x mandatory',
            }}
          >
            {carouselItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="w-60 sm:w-68 shrink-0 rounded-2xl bg-zinc-900/95 border border-amber-500/40 hover:border-amber-400 p-3.5 transition-all cursor-pointer group shadow-2xl transform hover:-translate-y-2 hover:scale-105 duration-500 backdrop-blur-md"
                style={{
                  scrollSnapAlign: 'start',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.85), 0 0 20px rgba(245, 158, 11, 0.15)',
                }}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 relative border border-zinc-800">
                  <ProgressiveProductImage
                    src={item.image}
                    alt={item.name}
                    className="group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                    {item.concentration || 'Extrait de Parfum'}
                  </div>
                  {item.volumeMl && (
                    <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300 border border-zinc-700">
                      {item.volumeMl}ml
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-amber-500 text-black font-bold text-[9px] px-2 py-0.5 rounded shadow">
                    Exclusivo 3D
                  </div>
                </div>

                <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider block truncate">
                  {item.brandName || 'Maison Royale'}
                </span>
                <h4 className="font-serif text-xs font-semibold text-white group-hover:text-amber-200 truncate mt-0.5">
                  {item.name}
                </h4>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    R$ {(item.salePrice || 1890).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item as Product);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    {addedProductId === item.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Adicionado</span>
                      </>
                    ) : (
                      <span>Comprar</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CATÁLOGO COMPLETO DA MARCA SELECIONADA EM GRADE (SEM LIMITE ARTIFICIAL) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>
              {selectedBrandId !== 'TODAS' && selectedBrandObj
                ? `Catálogo de Perfumes — ${selectedBrandObj.name} (${filteredProducts.length})`
                : `Catálogo Oficial de Fragrâncias (${filteredProducts.length})`}
            </span>
          </h3>
        </div>

        {/* Loading Skeleton */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-3 space-y-3 animate-pulse"
              >
                <div className="aspect-square rounded-xl bg-zinc-800/60" />
                <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
                <div className="h-4 w-3/4 bg-zinc-800/60 rounded" />
                <div className="h-3 w-1/3 bg-zinc-800/60 rounded" />
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-zinc-800/60 rounded" />
                  <div className="h-7 w-16 bg-zinc-800/60 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto">
              <Search className="w-5 h-5 text-amber-400/80" />
            </div>
            <h3 className="font-serif text-sm font-semibold text-zinc-200">
              Nenhum perfume encontrado nesta marca ou busca.
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tente redefinir os termos de busca ou selecione "Todas as Marcas" para ver todo o catálogo.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedBrandId('TODAS');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
            >
              Ver Todas as Fragrâncias
            </button>
          </div>
        ) : (
          /* Product Grid: Displays ALL products without artificial limit */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((p) => {
              const isAdded = addedProductId === p.id;
              const isOutOfStock = p.stockQuantity === 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-zinc-900/95 border border-zinc-800/90 hover:border-amber-500/40 p-3 sm:p-3.5 flex flex-col justify-between shadow-lg group transition-all duration-300 backdrop-blur-sm"
                >
                  <div>
                    {/* Product Photo with progressive loading */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 relative border border-zinc-800">
                      <ProgressiveProductImage
                        src={p.image}
                        alt={p.name}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Concentration Badge */}
                      <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                        {p.concentration || 'Eau de Parfum'}
                      </div>

                      {/* Volume Badge */}
                      <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-300 border border-zinc-700">
                        {p.volumeMl ? `${p.volumeMl}ml` : '100ml'}
                      </div>
                    </div>

                    {/* Brand */}
                    <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider block truncate">
                      {p.brandName || 'Maison Royale'}
                    </span>

                    {/* Name */}
                    <h4 className="font-serif text-xs sm:text-sm font-semibold text-white group-hover:text-amber-200 line-clamp-1 mt-0.5">
                      {p.name}
                    </h4>

                    {/* Olfactory Family */}
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {p.olfactoryFamily}
                    </p>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">
                        Valor
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300">
                        R$ {p.salePrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      disabled={isOutOfStock}
                      className={`px-3 sm:px-4 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs uppercase transition-all flex items-center gap-1 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {isOutOfStock ? (
                        <span>Esgotado</span>
                      ) : isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Pronto</span>
                        </>
                      ) : (
                        <span>Comprar</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

