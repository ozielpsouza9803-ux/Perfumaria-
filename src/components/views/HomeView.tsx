import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowRight,
  Crown,
  User,
  MessageCircle,
  MapPin,
  Share2,
  Menu,
  X,
  ShieldCheck,
  Compass,
  Layers
} from 'lucide-react';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { Product } from '../../types';
import { NavTab } from '../common/Sidebar';
import { Modal } from '../common/Modal';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenChat: () => void;
}

const INSTITUTIONAL_SLIDES = [
  {
    id: 1,
    title: 'Maison Royale Haute Parfumerie',
    subtitle: 'A quintessência dos aromas raros, mestre perfumistas e frascos de cristal lapidado à mão com folha de ouro 24k.',
    image: LUXURY_PRESET_IMAGES[0].url,
    tag: 'Tradição & Prestígio 2026',
  },
  {
    id: 2,
    title: 'Ateliê de Extrações Raras',
    subtitle: 'Curadoria mundial de essências puras e o refúgio da alta perfumaria internacional no coração dos Jardins em São Paulo.',
    image: LUXURY_PRESET_IMAGES[1].url,
    tag: 'Haute Parfumerie Paris',
  },
  {
    id: 3,
    title: 'Consultoria Olfativa Privée',
    subtitle: 'Experiências sensoriais exclusivas com sommeliers de fragrâncias e atendimento personalizado com hora marcada.',
    image: LUXURY_PRESET_IMAGES[2].url,
    tag: 'Atendimento VIP',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenChat }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPublicMenuOpen, setIsPublicMenuOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const p = await Database.getProducts();
      setProducts(p);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INSTITUTIONAL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Default display items for 3D cinematic floating showcase
  const showcaseItems = products.length > 0 ? products.slice(0, 6) : [
    { id: '1', name: 'Noir Oracle Extrait', brandName: 'House of Creed', salePrice: 1890, image: LUXURY_PRESET_IMAGES[0].url, concentration: 'Extrait de Parfum' },
    { id: '2', name: 'Oud Ambre Impérial', brandName: 'Amouage', salePrice: 2450, image: LUXURY_PRESET_IMAGES[1].url, concentration: 'Eau de Parfum' },
    { id: '3', name: 'Rêve de Rose & Ambre', brandName: 'Parfums de Marly', salePrice: 1680, image: LUXURY_PRESET_IMAGES[2].url, concentration: 'Extrait de Parfum' },
    { id: '4', name: 'Aurélia Blanche Haute', brandName: 'Maison Francis Kurkdjian', salePrice: 1450, image: LUXURY_PRESET_IMAGES[3].url, concentration: 'Eau de Parfum' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-28">
      {/* 1. CABEÇALHO E NAVEGAÇÃO */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublicMenuOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-2"
            title="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-serif font-semibold hidden sm:inline">Menu Maison</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md">
              <img
                src={LUXURY_PRESET_IMAGES[0].url}
                alt="Maison Royale"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-white tracking-wider block">
                MAISON ROYALE
              </span>
              <span className="text-[9px] text-amber-400 font-mono uppercase tracking-widest block">
                Haute Parfumerie Paris
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
        </div>
      </div>

      {/* 2. BANNER SUPERIOR PUBLICITÁRIO MUITO GRANDE (INDEPENDENTE) */}
      <section className="relative rounded-3xl overflow-hidden bg-zinc-950 border border-amber-500/35 shadow-2xl">
        <div className="relative aspect-16/9 md:aspect-21/9 w-full min-h-[400px] max-h-[540px] overflow-hidden">
          <img
            src={INSTITUTIONAL_SLIDES[currentSlide].image}
            alt={INSTITUTIONAL_SLIDES[currentSlide].title}
            className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />

          <div className="absolute inset-0 p-6 sm:p-12 lg:p-16 flex flex-col justify-end max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-amber-300 text-xs font-semibold uppercase tracking-widest w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{INSTITUTIONAL_SLIDES[currentSlide].tag}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-wide leading-tight">
              {INSTITUTIONAL_SLIDES[currentSlide].title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              {INSTITUTIONAL_SLIDES[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => onNavigate('vitrine')}
                className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Acessar Loja & Vitrine Pública</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('agenda')}
                className="px-6 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-amber-300 border border-amber-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
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
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? INSTITUTIONAL_SLIDES.length - 1 : prev - 1))}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {INSTITUTIONAL_SLIDES.map((_, i) => (
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
              onClick={() => setCurrentSlide((prev) => (prev + 1) % INSTITUTIONAL_SLIDES.length)}
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 backdrop-blur-md cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. & 4. ANIMAÇÃO PUBLICITÁRIA 3D — ELEMENTO PRINCIPAL (ÁREA CENTRAL COM LIMITES OBRIGATÓRIOS) */}
      <section className="relative my-10 py-8 px-4 rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Cinematic Header */}
        <div className="text-center space-y-2 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Showcase Tridimensional 3D</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-widest uppercase">
            Frascos Cinematográficos Flutuantes
          </h2>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Publicidade imersiva em loop contínuo de alta perfumaria com profundidade, rotação e circulação tridimensional.
          </p>
        </div>

        {/* 3D Floating Carousel Arena */}
        <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center overflow-hidden [perspective:1200px]">
          {/* Ambient Golden Glow Aura */}
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

          {/* Infinite Marquee 3D Orbiting Cards */}
          <div className="flex items-center gap-6 animate-marquee hover:[animation-play-state:paused] absolute whitespace-nowrap px-4">
            {[...showcaseItems, ...showcaseItems, ...showcaseItems].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onNavigate('vitrine')}
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
                  <span className="text-[10px] text-zinc-400 group-hover:text-amber-300 flex items-center gap-1 font-medium">
                    Explorar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4 relative z-10">
          <button
            type="button"
            onClick={() => onNavigate('vitrine')}
            className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Ver Catálogo Completo na Vitrine</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </section>

      {/* 5. INSTITUTIONAL STORYTELLING & HERITAGE (Bottom Section with safety margin from footer) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Herança & Maestria</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Fragrâncias formuladas por mestre perfumistas em Grasse e frascos lapidados artesanalmente com selo real de autenticidade.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Selo de Pureza Rara</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Extrações puríssimas de Oud selvagem de Assam, âmbar cinzento e absoluto de rosas centifólias com rastreabilidade garantida.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Ateliê Flagship SP</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Visite nossa flaghship store nos Jardins em São Paulo para uma experiência olfativa imersiva com degustação de extratos.
            </p>
          </div>
        </div>
      </section>

      {/* PUBLIC SIDE MENU DRAWER */}
      {isPublicMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsPublicMenuOpen(false)}
          />

          <div className="relative w-80 bg-zinc-950 border-r border-amber-500/30 p-6 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md">
                    <img
                      src={LUXURY_PRESET_IMAGES[0].url}
                      alt="Maison Royale"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white tracking-wider">
                      Maison Royale
                    </h3>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-mono">
                      Menu Institucional
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublicMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 transition-all text-left"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Início (Institucional)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    onNavigate('vitrine');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 border border-zinc-800 transition-all text-left"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Vitrine & Loja Virtual</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    onNavigate('cliente');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 border border-zinc-800 transition-all text-left"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Área do Cliente VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    setSocialModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 border border-zinc-800 transition-all text-left"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Redes Sociais</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    setLocationModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 border border-zinc-800 transition-all text-left"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Localização & Atendimento</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPublicMenuOpen(false);
                    onOpenChat();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 border border-zinc-800 transition-all text-left"
                >
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>Concierge Olfativo (Chat)</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsPublicMenuOpen(false);
                  onNavigate('dashboard');
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs rounded-xl shadow-md text-center hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Painel Administrativo (ADM)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOCIAL NETWORKS MODAL */}
      {socialModalOpen && (
        <Modal
          isOpen={socialModalOpen}
          onClose={() => setSocialModalOpen(false)}
          title="Redes Sociais — Maison Royale"
          subtitle="Conecte-se aos nossos canais oficiais de Haute Parfumerie"
        >
          <div className="space-y-3">
            {[
              { name: 'Instagram', handle: '@maisonroyale.parfumerie' },
              { name: 'WhatsApp VIP', handle: '+55 (11) 99888-7766' },
              { name: 'YouTube', handle: 'Maison Royale Haute Parfumerie' },
              { name: 'Facebook', handle: '/maisonroyaleparfum' },
            ].map((soc, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="font-serif text-sm font-semibold text-white block">{soc.name}</span>
                  <span className="text-xs text-amber-400 font-mono">{soc.handle}</span>
                </div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Redirecionando para ${soc.name} oficial da Maison Royale.`); }}
                  className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Seguir
                </a>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* LOCATION MODAL */}
      {locationModalOpen && (
        <Modal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          title="Ateliê Flagship — Jardins SP"
          subtitle="Rua Oscar Freire, 1840 — Jardim Paulista, São Paulo - SP"
        >
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-2">
              <span className="font-semibold text-amber-300 block">Horário de Atendimento Private:</span>
              <p className="text-zinc-400 leading-relaxed">
                Segunda a Sexta: das 10h às 20h<br />
                Sábados: das 10h às 18h<br />
                Atendimento com horário marcado ou livre na flagship store.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
