import React from 'react';
import { AppointmentsView } from './AppointmentsView';

export const AgendaModuloView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-white tracking-wide">
          Módulo 8: Agenda de Atendimentos & Consultorias Olfativas
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Agendamento de degustações de fragrâncias raras, personalização de frascos e atendimento na Sala Real da Maison Royale.
        </p>
      </div>

      <AppointmentsView />
    </div>
  );
};
