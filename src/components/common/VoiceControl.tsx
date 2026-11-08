import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceControlProps {
  onTranscript: (text: string) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'responding' | 'error') => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onTranscript, onStatusChange }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        onStatusChange?.('idle');
      };
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        onStatusChange?.('error');
      };
    }
  }, [onTranscript, onStatusChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      onStatusChange?.('idle');
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      onStatusChange?.('listening');
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all duration-300 ${
        isListening 
          ? 'bg-rose-600 animate-pulse' 
          : 'bg-gradient-to-r from-amber-500 to-amber-600'
      } text-black shadow-lg cursor-pointer`}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};
