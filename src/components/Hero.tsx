import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, CheckCircle2, Clock, MapPin, Sparkles, Shield, Shirt, Truck, PhoneCall, MessageCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { WHATSAPP_NUMBER } from '../config/constants';

export const Hero: React.FC = () => {
  const { startOrderWithService, setActiveView } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Subtle geometric background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 -ml-20 w-80 h-80 rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top pill badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Sastrería a Domicilio JTH</span>
                <span className="text-amber-400">•</span>
                <span className="text-amber-800 font-semibold">Taller Oficial</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-900 text-xs font-semibold shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Bogotá D.C.</span>
                <span className="text-slate-400">•</span>
                <span className="text-sky-700">Entrega 24-48 hrs</span>
              </div>
            </div>

            {/* Main Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-950 leading-[1.12]">
              Tu ropa limpia, planchada y{' '}
              <span className="text-sky-600 underline decoration-sky-300 decoration-wavy decoration-2">
                como nueva.
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Recogemos tu ropa en casa, la lavamos, planchamos o arreglamos con maestría de sastrería y la entregamos donde estés en toda Bogotá.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-btn-solicitar"
                onClick={() => startOrderWithService()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-blue-950 hover:bg-blue-900 shadow-xl shadow-blue-950/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Solicitar servicio</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-servicios"
                onClick={() => {
                  setActiveView('services');
                  const el = document.getElementById('servicios-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-blue-950 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center"
              >
                Ver servicios
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  'Hola Jose Tiberio, requiero información y recogida para servicio de sastrería/ropa a domicilio.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-4 rounded-2xl text-base font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp Asesor</span>
              </a>
            </div>

            {/* Value Props Checkmarks */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Recogida puntual</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Prendas en gancho o dobladas</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sastrería con garantía</span>
              </div>
            </div>
          </div>

          {/* Graphic / Visual Illustration Showcase: OFFICIAL LOGO ON PORTADA */}
          <div className="lg:col-span-5 relative flex flex-col items-center gap-5">
            {/* The Official Brand Logo Card */}
            <div className="w-full max-w-md">
              <BrandLogo variant="hero" showPhone={true} />
            </div>

            {/* Quick Interactive Order / Express Service Card */}
            <div className="w-full max-w-md bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100 relative z-10 transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Shirt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-blue-950">Servicio Express Activo</h3>
                    <p className="text-[11px] text-slate-500">Recogida y entrega en Bogotá</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  En ruta hoy
                </span>
              </div>

              {/* Service sample summary */}
              <div className="py-2.5 flex items-center justify-between text-xs text-slate-600">
                <span>⏱ Entrega 24 a 48 hrs</span>
                <span className="font-semibold text-blue-950">Chapinero, Usaquén, Suba...</span>
              </div>

              {/* Action */}
              <button
                onClick={() => startOrderWithService()}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 active:scale-98 transition shadow-md shadow-blue-950/20 flex items-center justify-center gap-2"
              >
                <span>Solicitar recogida ahora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Floating mini-badge */}
            <div className="hidden sm:flex absolute -bottom-3 -left-4 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 items-center gap-2 z-20">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">A domicilio en Bogotá</p>
                <p className="text-[9px] text-slate-500">En la puerta de tu casa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
