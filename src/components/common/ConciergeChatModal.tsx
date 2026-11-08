import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

import { NavTab } from './Sidebar';
import { VoiceControl } from './VoiceControl';
import { ProfilePhotoManager } from './ProfilePhotoManager';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleOpen?: () => void;
  onNavigate?: (tab: NavTab) => void;
  currentTab?: NavTab;
}

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  onToggleOpen,
  onNavigate,
  currentTab = 'home',
}) => {
  const { currentAdmin } = useAuth();
  const { success } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'concierge',
      text: `Bonjour! Sou o Concierge Olfativo da Maison Royale. Como posso orientar sua experiência sensorial hoje?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      options: [
        'Recomendação de Fragrância',
        'Status do Meu Pedido',
        'Agendar Consultoria VIP',
        'Gravação Personalizada 24k',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('mr_ai_photo_Concierge') || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mr_ai_photo_Concierge', profilePhoto);
  }, [profilePhoto]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const txt = (textToSend || inputMessage).trim();
    if (!txt) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: txt,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Concierge Assistant Automated AI Response
    setTimeout(() => {
      let replyText = 'Agradeço seu contato com a Maison Royale! Um especialista olfativo responderá em instantes.';
      let replyOptions: string[] | undefined;

      const lower = txt.toLowerCase();
      if (lower.includes('recomendação') || lower.includes('fragrância') || lower.includes('perfume')) {
        replyText = 'Para indicações sob medida, quais famílias olfativas mais despertam seu interesse? Nossos destaques incluem Amadeirados Nobres, Orientais & Âmbar, e Florais de Grasse.';
        replyOptions = ['Amadeirado Defumado', 'Oriental Amber', 'Floral Centifólia', 'Cítrico Mediterrâneo'];
      } else if (lower.includes('pedido') || lower.includes('status') || lower.includes('entrega')) {
        replyText = 'Seus pedidos VIP são acompanhados por transporte aéreo rastreado e seguro integral. Informe o número do pedido (ex: MR-9042) para consulta em tempo real.';
      } else if (lower.includes('agendar') || lower.includes('consultoria') || lower.includes('vip')) {
        replyText = 'A consultoria VIP Private Room inclui degustação de extratos raros e harmonização olfativa na boutique Flagship dos Jardins.';
        replyOptions = ['Agendar na Boutique Jardins', 'Atendimento Privativo Digital'];
      } else if (lower.includes('gravação') || lower.includes('ouro')) {
        replyText = 'O serviço de gravação artesanal em placa de ouro 24k está disponível cortesia para todos os frascos de Extrait de Parfum de 100ml.';
      }

      const conciergeMsg: ChatMessage = {
        id: 'msg_reply_' + Date.now(),
        sender: 'concierge',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        options: replyOptions,
      };

      setMessages((prev) => [...prev, conciergeMsg]);
      
      // Text-to-Speech
      const utterance = new SpeechSynthesisUtterance(replyText);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }, 600);
  };

  const isHome = currentTab === 'home';

  return (
    <>
      {/* Floating Concierge Chat Button — Positioned safely above bottom nav without blocking buttons */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isHome
            ? 'bottom-20 sm:bottom-20 md:bottom-22 lg:bottom-6 right-3 sm:right-6'
            : 'bottom-6 right-3 sm:right-6'
        }`}
      >
        <button
          type="button"
          onClick={onToggleOpen || onClose}
          className="group p-2.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-serif font-bold text-xs rounded-full shadow-2xl shadow-amber-500/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
          </div>
          <span className="hidden md:inline font-sans text-xs">Concierge VIP</span>
          <MessageSquare className="w-4 h-4 md:hidden" />
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : null}
        </button>
      </div>

      {/* Floating Chat Window Modal — Resized proportionally for mobile, tablet, and desktop */}
      {isOpen && (
        <div
          className={`fixed z-50 w-[calc(100vw-24px)] max-w-[340px] md:w-84 md:max-w-[360px] lg:w-96 lg:max-w-[380px] h-[380px] sm:h-[420px] max-h-[70vh] bg-zinc-950/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl shadow-2xl shadow-black flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            isHome
              ? 'bottom-20 sm:bottom-20 md:bottom-24 lg:bottom-8 right-3 sm:right-6'
              : 'bottom-6 right-3 sm:right-6'
          }`}
        >
          {/* Chat Header */}
          <div className="p-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="font-serif text-xs font-bold text-white">Concierge Olfativo Private</h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Ateliê Online
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => {
              const isConcierge = m.sender === 'concierge';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isConcierge ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      isConcierge
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-tr-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`text-[9px] font-mono mt-1 block text-right ${
                        isConcierge ? 'text-zinc-500' : 'text-black/70'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {/* Interactive Option Chips */}
                  {isConcierge && m.options && m.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(opt)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] transition-colors cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2"
          >
            <VoiceControl onTranscript={(text) => setInputMessage(text)} />
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite ou fale sua mensagem..."
              className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
