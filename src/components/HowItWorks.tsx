import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Truck, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { startOrderWithService } = useApp();

  const steps = [
    {
      num: '1',
      title: 'Solicitas',
      description: 'Elige los servicios que necesitas (lavado, planchado o arreglos) y programa la fecha y hora de recogida en Bogotá.',
      icon: Smartphone,
      color: 'bg-blue-50 text-blue-900 border-blue-200',
    },
    {
      num: '2',
      title: 'Recogemos',
      description: 'Nuestro mensajero pasa por tu domicilio u oficina en la franja acordada y recibe tus prendas en bolsas selladas.',
      icon: Truck,
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      num: '3',
      title: 'Lavamos / planchamos / arreglamos',
      description: 'En nuestras instalaciones especializadas realizamos el lavado profesional, planchado a vapor o ajustes con sastres expertos.',
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      num: '4',
      title: 'Entregamos',
      description: 'Te llevamos tu ropa impecable, doblada o en ganchos con protector, directo a donde estés en Bogotá.',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <section id="como-funciona-section" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 px-3 py-1 bg-sky-100 rounded-full">
            Paso a Paso
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
            ¿Cómo funciona Ropa Express?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Hacer que tu ropa esté lista nunca fue tan fácil. En 4 sencillos pasos nos encargamos de todo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50/60 rounded-3xl p-7 border border-slate-200/80 flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${step.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="w-8 h-8 rounded-full bg-blue-950 text-white text-sm font-extrabold flex items-center justify-center shadow-xs">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-blue-950 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-sky-700">
                  <span>Paso {idx + 1} de 4</span>
                  {idx < 3 && <ArrowRight className="w-4 h-4 text-slate-400 hidden lg:block" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <button
            id="btn-como-funciona-solicitar"
            onClick={() => startOrderWithService()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 shadow-xl shadow-blue-950/20 active:scale-95 transition"
          >
            <span>Empieza ahora y solicita tu servicio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
