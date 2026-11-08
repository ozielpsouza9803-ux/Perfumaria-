import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Check,
} from 'lucide-react';
import { VoiceControl } from './VoiceControl';

interface AiGestoraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'ai' | 'admin';
  text: string;
  timestamp: string;
  action?: {
    type: 'CREATE_PRODUCT' | 'UPDATE_STOCK' | 'UPDATE_PRICE';
    payload: any;
  };
  actionStatus?: 'pending' | 'confirmed' | 'cancelled';
}

export const AiGestoraModal: React.FC<AiGestoraModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Bonjour! Sou a IA Gestora da Maison Royale. Agora estou totalmente integrada para executar operações de escrita no Supabase com confirmação de segurança. Posso cadastrar novos perfumes, registrar entradas e saídas de estoque ou atualizar preços. Como posso ajudar o ateliê hoje?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (text: string) => {
    const promptText = text.trim();
    if (!promptText || isProcessing) return;

    const userMsg: Message = {
      sender: 'admin',
      text: promptText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText }),
      });

      const data = await res.json();
      
      const aiReply: Message = {
        sender: 'ai',
        text: data.reply || 'Processamento concluído.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        action: data.action || undefined,
        actionStatus: data.action ? 'pending' : undefined,
      };

      setMessages((prev) => [...prev, aiReply]);
      
      // Text-to-Speech
      const utterance = new SpeechSynthesisUtterance(aiReply.text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      const errorReply: Message = {
        sender: 'ai',
        text: 'Desculpe, ocorreu uma instabilidade ao consultar a central de inteligência.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async (msgIndex: number, action: NonNullable<Message['action']>) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin-ai-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: action.type, payload: action.payload }),
      });
      const data = await res.json();

      setMessages((prev) =>
        prev.map((m, idx) => {
          if (idx === msgIndex) {
            return {
              ...m,
              actionStatus: data.success ? 'confirmed' : 'cancelled',
              text: `${m.text}\n\n✅ [Resultado da Execução]: ${data.message}`,
            };
          }
          return m;
        })
      );

      if (data.success) {
        window.dispatchEvent(new CustomEvent('mr_database_change'));
      }
    } catch (err) {
      alert('Erro ao executar operação no Supabase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAction = (msgIndex: number) => {
    setMessages((prev) =>
      prev.map((m, idx) => {
        if (idx === msgIndex) {
          return {
            ...m,
            actionStatus: 'cancelled',
            text: `${m.text}\n\n❌ [Operação Cancelada]`,
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-4xl h-[88vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-lg">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  IA GESTORA — Central Operacional Ativa
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Supabase Write Enabled
                </span>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${m.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${m.sender === 'admin' ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-900 text-amber-400 border-amber-500/30'}`}>
                {m.sender === 'admin' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${m.sender === 'admin' ? 'bg-amber-500/15 border border-amber-500/30 text-zinc-100 rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.action && m.actionStatus === 'pending' && (
                  <div className="p-3.5 mt-3 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Confirmação de Operação</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button type="button" onClick={() => handleCancelAction(idx)} className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer">Cancelar</button>
                      <button type="button" onClick={() => handleConfirmAction(idx, m.action!)} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmar</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className={`text-[10px] font-mono text-right mt-1 ${m.sender === 'admin' ? 'text-amber-400/80' : 'text-zinc-500'}`}>{m.timestamp}</div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>IA Gestora processando...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-3"
          >
            <VoiceControl onTranscript={(text) => handleSend(text)} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite ou fale sua mensagem..."
              className="flex-1 px-4 py-3 bg-zinc-950 border border-amber-500/30 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button type="submit" className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg transition-all shrink-0">
              <Send className="w-4 h-4 text-black" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

