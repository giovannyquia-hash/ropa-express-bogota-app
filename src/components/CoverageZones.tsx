import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, CheckCircle2, AlertCircle, Clock, Search, Navigation } from 'lucide-react';

export const CoverageZones: React.FC = () => {
  const { deliveryZones } = useApp();
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [coverageResult, setCoverageResult] = useState<{
    found: boolean;
    locality?: string;
    fee?: number;
    hours?: string;
  } | null>(null);

  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNeighborhood.trim()) return;

    const term = searchNeighborhood.toLowerCase().trim();

    // Check by neighborhood or locality name
    const match = deliveryZones.find(
      (z) =>
        z.locality.toLowerCase().includes(term) ||
        z.neighborhoods.some((n) => n.toLowerCase().includes(term))
    );

    if (match && match.covered) {
      setCoverageResult({
        found: true,
        locality: match.locality,
        fee: match.deliveryFee,
        hours: match.estimatedHours,
      });
    } else {
      setCoverageResult({
        found: false,
      });
    }
  };

  return (
    <section id="cobertura-section" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 px-3 py-1 bg-sky-100 rounded-full">
            Bogotá D.C.
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
            Zonas de Cobertura y Domicilios
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Llegamos a las principales localidades de la capital. Consulta si tu barrio está cubierto y la tarifa correspondiente.
          </p>
        </div>

        {/* Coverage Checker Input */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleCheckCoverage} className="relative flex items-center">
            <input
              type="text"
              placeholder="Ingresa tu barrio o localidad (ej. Cedritos, Chapinero, Niza)..."
              value={searchNeighborhood}
              onChange={(e) => setSearchNeighborhood(e.target.value)}
              className="w-full pl-11 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition"
            >
              Consultar
            </button>
          </form>

          {/* Result Alert */}
          {coverageResult && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              {coverageResult.found ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">¡Tenemos cobertura en tu zona!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Localidad: <span className="font-semibold">{coverageResult.locality}</span> • Tarifa de domicilio:{' '}
                      <span className="font-bold">${coverageResult.fee?.toLocaleString('es-CO')} COP</span> • Tiempo estimado:{' '}
                      <span className="font-semibold">{coverageResult.hours}</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Actualmente no tenemos cobertura en esta zona</h4>
                    <p className="text-xs text-amber-800 mt-1">
                      Estamos expandiendo rutas constantemente. Escríbenos a WhatsApp para coordinar rutas especiales si estás cerca.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Localities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryZones.map((zone) => (
            <div
              key={zone.id}
              className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-blue-950">{zone.locality}</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-slate-700">Barrios destacados:</span>{' '}
                  {zone.neighborhoods.join(', ')}.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{zone.estimatedHours}</span>
                </div>
                <span className="font-bold text-sky-900 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">
                  Domicilio: ${zone.deliveryFee.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
