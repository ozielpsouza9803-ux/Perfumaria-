import React from 'react';
import { Camera } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface ProfilePhotoManagerProps {
  photo: string;
  setPhoto: (photo: string) => void;
  iaName: string;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ photo, setPhoto, iaName }) => {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Camera className="w-4 h-4 text-amber-400" />
        <h4 className="font-serif text-sm font-bold text-white">Foto de Perfil: {iaName}</h4>
      </div>
      <ImageUpload 
        value={photo} 
        onChange={setPhoto} 
        label="Alterar Foto" 
        hint="Envie uma foto profissional para personalizar a identidade desta IA"
      />
    </div>
  );
};
