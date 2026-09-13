'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, CircleHelp, Sparkles } from 'lucide-react';

interface GuidanceCardProps {
  title?: string;
  subtitle?: string;
  steps?: string[];
  cta?: string;
  highlight?: string;
}

export const GuidanceCard: React.FC<GuidanceCardProps> = ({
  title = 'Proceso Banorte',
  subtitle = 'Lo que debes hacer para avanzar con tu solicitud',
  steps = [
    'Define el monto y el plazo que necesitas.',
    'Revisa tus ingresos, gastos y capacidad de pago.',
    'Solicita tu precalificación con tus datos básicos.',
    'Compara opciones de pago y confirma tu solicitud.',
  ],
  cta = 'Continuar con mi solicitud',
  highlight = 'Te recomiendo empezar por una precalificación.',
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl max-w-lg my-4 transition-all">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
            <CircleHelp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Recomendado
        </span>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 text-sm text-red-800 font-medium">
        {highlight}
      </div>

      <div className="space-y-3 mb-5">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
            <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
            <div className="text-sm text-gray-700">{step}</div>
          </div>
        ))}
      </div>

      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]">
        <CheckCircle2 className="w-5 h-5" />
        {cta}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
