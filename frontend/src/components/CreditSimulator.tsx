'use client';

import React from 'react';
import { Car, Calendar, DollarSign, Percent, CheckCircle, PieChart, Table } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CreditSimulatorProps {
  monto_solicitado?: number;
  plazo_meses?: number;
  tasa_anual_porcentaje?: number;
  pago_mensual_estimado?: number;
  costo_total_estimado?: number;
}

export const CreditSimulator: React.FC<CreditSimulatorProps> = ({
  monto_solicitado = 300000,
  plazo_meses = 36,
  tasa_anual_porcentaje = 12.5,
  pago_mensual_estimado = 10034.02,
  costo_total_estimado = 361224.72,
}) => {
  const totalIntereses = Math.max(0, costo_total_estimado - monto_solicitado);

  // Datos para el gráfico visual de Dona
  const chartData = [
    { name: 'Monto Solicitado', value: monto_solicitado, color: '#DC2626' }, // Rojo Banorte
    { name: 'Intereses Estimados', value: totalIntereses, color: '#FCA5A5' }, // Rojo claro
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl max-w-lg my-4 transition-all">
      {/* Header Banorte */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Simulador Auto Banorte</h3>
            <p className="text-xs text-gray-500">Plan personalizado pre-aprobado</p>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Aprobado
        </span>
      </div>

      {/* Tarjeta Destacada de Pago Mensual */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs text-red-100 font-semibold uppercase tracking-wider">Pago Mensual Estimado</p>
          <p className="text-4xl font-black mt-1 tracking-tight">
            ${pago_mensual_estimado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            <span className="text-base font-normal text-red-200"> /mes</span>
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Sección Gráfica y Visual */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-red-600" /> Desglose Financiero
        </div>
        
        <div className="flex items-center justify-between h-40">
          {/* Gráfico Recharts */}
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString('es-MX')}`, '']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda Visual */}
          <div className="w-1/2 space-y-3 text-xs pl-2">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                Capital Solicitado
              </div>
              <p className="font-bold text-gray-900 text-sm ml-4">
                ${monto_solicitado.toLocaleString('es-MX')}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                Intereses + Costos
              </div>
              <p className="font-bold text-gray-900 text-sm ml-4">
                ${totalIntereses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Estructurada de Datos */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Table className="w-4 h-4 text-red-600" /> Resumen de Condiciones
        </div>
        
        <div className="divide-y divide-gray-100 text-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex justify-between p-3 bg-white hover:bg-gray-50">
            <span className="text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" /> Plazo Total
            </span>
            <span className="font-semibold text-gray-800">{plazo_meses} Meses</span>
          </div>
          <div className="flex justify-between p-3 bg-white hover:bg-gray-50">
            <span className="text-gray-500 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" /> Tasa Anual Fija
            </span>
            <span className="font-semibold text-gray-800">{tasa_anual_porcentaje}%</span>
          </div>
          <div className="flex justify-between p-3 bg-white hover:bg-gray-50">
            <span className="text-gray-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" /> Costo Total Estimado
            </span>
            <span className="font-bold text-red-600">
              ${costo_total_estimado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <button
        onClick={() => alert('¡Solicitud de crédito enviada a revisión Banorte!')}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]"
      >
        <CheckCircle className="w-5 h-5" />
        Solicitar Crédito Ahora
      </button>
    </div>
  );
};