import React from 'react';
import { useApp } from '../context/AppContext';
import { Waves, Sparkles, Scissors, Check, Shirt, PackageCheck, ShoppingCart, ArrowRight } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const { startOrderWithService, addToCart, setIsCartOpen } = useApp();

  const servicesList = [
    {
      id: 'srv-1',
      title: 'LAVADO',
      subtitle: 'Por kilogramo o prendas',
      icon: Waves,
      iconBg: 'bg-sky-100 text-sky-700',
      description: 'Lavado profesional de tus prendas con jabones hipoalergénicos y cuidado de fibras.',
      rate: 'Desde $8.000 COP / kg',
      defaultPrice: 8000,
      garmentType: 'Ropa de diario (1 Kg)',
      serviceName: 'Lavado y secado',
      features: ['Separación por color y tejido', 'Secado a temperatura controlada', 'Doblado listo para guardar'],
      buttonLabel: 'Solicitar lavado',
      highlight: false,
    },
    {
      id: 'srv-2',
      title: 'PLANCHADO',
      subtitle: 'Acabado de tintorería',
      icon: Shirt,
      iconBg: 'bg-blue-100 text-blue-800',
      description: 'Planchado profesional para que tus prendas queden impecables, sin arrugas ni brillos.',
      rate: '$3.000 COP / prenda',
      defaultPrice: 3000,
      garmentType: 'Camisa / Blusa',
      serviceName: 'Planchado a vapor',
      features: ['Planchado vertical a vapor', 'Entregado en ganchos o doblado', 'Cuidado de botones y cuellos'],
      buttonLabel: 'Solicitar planchado',
      highlight: false,
    },
    {
      id: 'srv-7',
      title: 'ARREGLOS',
      subtitle: 'Sastrería y modistería',
      icon: Scissors,
      iconBg: 'bg-amber-100 text-amber-800',
      description: 'Arreglos, ajustes y reparaciones de prendas con sastres y modistas expertos.',
      rate: 'Desde $8.000 COP',
      defaultPrice: 8000,
      garmentType: 'Pantalón',
      serviceName: 'Dobladillo / Ajuste',
      features: ['Dobladillos originales o invisibles', 'Ajuste de cintura y mangas', 'Cambio de cremalleras y botones'],
      buttonLabel: 'Solicitar arreglo',
      highlight: false,
    },
    {
      id: 'srv-3',
      title: 'LAVADO + PLANCHADO',
      subtitle: 'El combo más popular',
      icon: Sparkles,
      iconBg: 'bg-sky-600 text-white',
      description: 'Recogemos, lavamos, secamos y planchamos. Tus prendas listas para usar en tu semana.',
      rate: 'Desde $4.000 COP / prenda',
      defaultPrice: 4000,
      garmentType: 'Prenda mixta',
      serviceName: 'Lavado + Planchado',
      features: ['Todo el ciclo en una sola orden', 'Prendas con aroma fresco', 'Protector individual'],
      buttonLabel: 'Solicitar combo',
      highlight: true,
      badge: 'Más solicitado',
    },
    {
      id: 'srv-11',
      title: 'SERVICIO COMPLETO',
      subtitle: 'Cuidado textil integral',
      icon: PackageCheck,
      iconBg: 'bg-blue-950 text-white',
      description: 'Recogida + lavado + planchado + entrega con prioridad en horario y máxima atención.',
      rate: '$25.000 COP base',
      defaultPrice: 25000,
      garmentType: 'Lote semanal',
      serviceName: 'Servicio Integral',
      features: ['Recogida prioritaria express', 'Todo incluido puerta a puerta', 'Empaque premium antimanchas'],
      buttonLabel: 'Solicitar completo',
      highlight: false,
    },
  ];

  return (
    <section id="servicios-section" className="py-16 lg:py-24 bg-slate-50/70 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 px-3 py-1 bg-sky-100 rounded-full">
            Nuestros Servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
            ¿Qué necesitas?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Selecciona el servicio perfecto para tu ropa. Recogemos en cualquier localidad de Bogotá D.C.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {servicesList.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                id={`card-service-${srv.id}`}
                className={`bg-white rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between relative group hover:shadow-xl hover:-translate-y-1 ${
                  srv.highlight
                    ? 'border-sky-300 shadow-lg shadow-sky-900/5 ring-2 ring-sky-500/20'
                    : 'border-slate-200/80 shadow-xs'
                }`}
              >
                {srv.badge && (
                  <span className="absolute -top-3 right-6 bg-gradient-to-r from-sky-600 to-blue-950 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-md">
                    {srv.badge}
                  </span>
                )}

                <div>
                  {/* Icon & Category */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${srv.iconBg}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {srv.subtitle}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-blue-950 tracking-tight">{srv.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{srv.description}</p>

                  {/* Price Tag */}
                  <div className="mt-4 py-2 px-3.5 rounded-xl bg-slate-50 border border-slate-100 inline-block">
                    <span className="text-xs font-bold text-sky-900">{srv.rate}</span>
                  </div>

                  {/* Feature bullets */}
                  <ul className="mt-5 space-y-2.5">
                    {srv.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Buttons: Agregar al carrito + Solicitar */}
                <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    id={`btn-cart-add-${srv.id}`}
                    onClick={() => {
                      addToCart({
                        serviceId: srv.id,
                        garmentType: srv.garmentType,
                        serviceName: srv.serviceName,
                        quantity: 1,
                        unitPrice: srv.defaultPrice,
                        unit: 'Servicio',
                        description: `Solicitud de ${srv.title}`,
                        isEstimate: true,
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-98 border border-amber-400/80 bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-700" />
                    <span>+ Agregar al Carrito</span>
                  </button>

                  <button
                    id={`btn-select-${srv.id}`}
                    onClick={() => startOrderWithService(srv.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-98 shadow-xs flex items-center justify-center gap-1.5 ${
                      srv.highlight
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                        : 'bg-blue-950 hover:bg-blue-900 text-white shadow-blue-950/10'
                    }`}
                  >
                    <span>{srv.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
