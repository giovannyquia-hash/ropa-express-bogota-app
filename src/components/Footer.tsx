import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, MessageCircle, MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, openWhatsApp, setAuthModalOpen, deliveryZones } = useApp();

  return (
    <footer className="bg-blue-950 text-white pt-16 pb-24 md:pb-12 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-blue-900/60">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shadow-black/20 flex-shrink-0">
                <img
                  src="/logo-sastreria.svg"
                  alt="Logo Sastrería JTH"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight font-serif text-white">SASTRERÍA</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    JTH
                  </span>
                </div>
                <p className="text-xs text-slate-300">A Domicilio en Bogotá D.C.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              "Lavamos, planchamos y arreglamos. Tú solo disfruta." Cuidado textil de alta gama, sastrería y modistería profesional a domicilio en Bogotá.
            </p>

            <div className="pt-2">
              <button
                onClick={() => openWhatsApp()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Col 3: Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Navegación</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">
                  Servicios
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('how-it-works'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">
                  Cómo funciona
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('pricing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">
                  Calculadora de precios
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveView('tracking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">
                  Seguimiento de pedido
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Horarios y Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Atención</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Lunes a Sábado:</p>
                  <p>7:00 a.m. - 7:00 p.m.</p>
                  <p className="font-semibold text-white mt-1">Domingos y festivos:</p>
                  <p>8:00 a.m. - 2:00 p.m.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Bogotá D.C., Colombia</span>
              </div>
            </div>
          </div>

          {/* Col 5: Localidades Cobertura */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Localidades</h4>
            <div className="flex flex-wrap gap-1.5">
              {deliveryZones.slice(0, 8).map((z) => (
                <span
                  key={z.id}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-blue-900/60 text-slate-200 border border-blue-800"
                >
                  {z.locality}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 ROPA EXPRESS BOGOTÁ. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('admin')}
              className="hover:text-sky-300 flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Administrativo</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Hecho con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> en Bogotá
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
