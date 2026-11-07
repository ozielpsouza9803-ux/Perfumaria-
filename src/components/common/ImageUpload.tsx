import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, Check } from 'lucide-react';
import { LUXURY_PRESET_IMAGES } from '../../services/database';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Fotografia do Frasco / Produto',
  hint = 'Selecione uma foto da sua galeria ou escolha uma imagem do catálogo de luxo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-amber-300/90">{label}</label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showPresets ? 'Ocultar Fotos de Estúdio' : 'Fotos de Estúdio Haute'}
        </button>
      </div>

      {showPresets && (
        <div className="p-3 bg-zinc-950/80 border border-amber-500/20 rounded-lg space-y-2">
          <p className="text-xs text-zinc-400">Escolha um ensaio fotográfico de alta resolução:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LUXURY_PRESET_IMAGES.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setShowPresets(false);
                  }}
                  className={`group relative aspect-4/3 rounded-lg overflow-hidden border transition-all text-left ${
                    isSelected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-zinc-800 hover:border-amber-500/50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-zinc-200 line-clamp-1">{preset.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-amber-400 text-black p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-amber-500/30 bg-zinc-950 aspect-16/9 max-h-56 flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-zinc-900/90 text-amber-200 border border-amber-500/40 rounded-lg text-xs hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Trocar Foto da Galeria
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-rose-950/80 text-rose-200 border border-rose-500/40 rounded-lg text-xs hover:bg-rose-900 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-zinc-800 hover:border-amber-500/50 bg-zinc-950/50 hover:bg-zinc-950'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs text-zinc-300 font-medium">
              Toque para abrir a <span className="text-amber-300 underline underline-offset-2">galeria do dispositivo</span>
            </div>
            <p className="text-[11px] text-zinc-500">{hint}</p>
          </div>
        </div>
      )}

      {/* Hidden file input for native device gallery access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
