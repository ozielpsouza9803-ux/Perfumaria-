import React from 'react';
import { Home, User, Package, MessageSquare } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenChat?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenChat,
  onToggleChat,
  isChatOpen = false,
}) => {
  const handleChatClick = () => {
    if (onOpenChat) onOpenChat();
    else if (onToggleChat) onToggleChat();
  };
  const isHome = currentTab === 'home';
  const isCliente = currentTab === 'cliente';
  const isVitrine = currentTab === 'vitrine';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-amber-500/20 px-3 py-2 pb-safe sm:py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Início */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            isHome
              ? 'text-amber-300 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'text-amber-400' : ''}`} />
          <span className="text-[10px] tracking-wide">Início</span>
        </button>

        {/* 2. Vitrine */}
        <button
          type="button"
          onClick={() => onSelectTab('vitrine')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            isVitrine
              ? 'text-amber-300 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Package className={`w-5 h-5 ${isVitrine ? 'text-amber-400' : ''}`} />
          <span className="text-[10px] tracking-wide">Vitrine</span>
        </button>

        {/* 3. Cliente */}
        <button
          type="button"
          onClick={() => onSelectTab('cliente')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            isCliente
              ? 'text-amber-300 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className={`w-5 h-5 ${isCliente ? 'text-amber-400' : ''}`} />
          <span className="text-[10px] tracking-wide">Cliente</span>
        </button>

        {/* 4. Chat */}
        <button
          type="button"
          onClick={handleChatClick}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
            isChatOpen
              ? 'text-amber-300 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${isChatOpen ? 'text-amber-400' : ''}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-wide">Chat</span>
        </button>
      </div>
    </nav>
  );
};
