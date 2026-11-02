import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Alejandro Pardo',
      location: 'Chapinero Alto, Bogotá',
      rating: 5,
      comment:
        'Excelente servicio. Recogieron mis camisas y ternos el lunes por la mañana y me los entregaron el miércoles en la tarde impecables, en ganchos y con un empaque muy fino.',
      service: 'Lavado + Planchado Camisas',
    },
    {
      name: 'Camila Duarte',
      location: 'Cedritos, Usaquén',
      rating: 5,
      comment:
        'Tenía un vestido de fiesta al que se le había roto la cremallera y necesitaba ajuste de cintura. Subí la foto al asistente de IA, me cotizaron y el sastre hizo un trabajo perfecto.',
      service: 'Arreglos y Sastrería',
    },
    {
      name: 'Felipe Santamaría',
      location: 'Colina Campestre, Suba',
      rating: 5,
      comment:
        'Lo mejor es la puntualidad del domiciliario. No tengo tiempo de planchar durante la semana y Ropa Express me solucionó la vida. 100% recomendado.',
      service: 'Planchado Semanal',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 px-3 py-1 bg-sky-100 rounded-full">
            Clientes Satisfechos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
            Lo que dicen en Bogotá
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Miles de prendas cuidadas con dedicación y entregadas a tiempo en toda la ciudad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-sky-200" />
                </div>

                <p className="text-sm text-slate-600 italic leading-relaxed">"{t.comment}"</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-blue-950">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.location}</p>
                <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-100">
                  {t.service}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
