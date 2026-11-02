import React from 'react';
import { WHATSAPP_NUMBER } from '../config/constants';

interface BrandLogoProps {
  variant?: 'full' | 'hero' | 'header' | 'footer' | 'icon';
  className?: string;
  showPhone?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  showPhone = true,
}) => {
  // Pure vector icon for Header/compact spaces
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 50 60"
        className={`w-8 h-10 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2C275" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#9B7A2B" />
          </linearGradient>
        </defs>
        {/* Mannequin knob */}
        <circle cx="25" cy="8" r="3" stroke="url(#goldIcon)" strokeWidth="2" />
        <path d="M 22 11 L 22 15 M 28 11 L 28 15" stroke="url(#goldIcon)" strokeWidth="1.8" />
        {/* Torso */}
        <path
          d="M 12 21 C 15 18, 20 16, 25 16 C 30 16, 35 18, 38 21 C 36 27, 33 33, 32 39 C 31 43, 34 49, 35 53 C 35 55, 34 56, 25 56 C 16 56, 15 55, 15 53 C 16 49, 19 43, 18 39 C 17 33, 14 27, 12 21 Z"
          stroke="url(#goldIcon)"
          strokeWidth="2"
          fill="none"
        />
        {/* Thread */}
        <path
          d="M 32 39 C 38 41, 45 37, 48 33 C 45 30, 38 32, 33 34"
          stroke="url(#goldIcon)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Header compact emblem
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-2 flex items-center justify-center shadow-md shadow-slate-900/15 border border-amber-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
          <img
            src={`${import.meta.env.BASE_URL}logo-sastreria.svg`}
            alt="Logo Sastrería JTH"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(212,175,55,0.4)]"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-serif tracking-wider text-base sm:text-lg font-bold text-slate-900 leading-tight">
              SASTRERÍA
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 tracking-widest uppercase">
              JTH
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
            A Domicilio Bogotá
          </span>
        </div>
      </div>
    );
  }

  // Hero Portada Luxury Card (The centerpiece of the cover)
  return (
    <div
      className={`relative bg-gradient-to-b from-white via-amber-50/10 to-slate-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/70 shadow-2xl shadow-amber-950/5 ${className}`}
    >
      {/* Decorative luxury corners */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400/60 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400/60 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400/60 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400/60 rounded-br-sm pointer-events-none" />

      {/* Main SVG Logo Container */}
      <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            'Hola Jose Tiberio, vi el logo oficial de Sastrería a Domicilio JTH y deseo solicitar un servicio.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
          title="Contactar al taller de Sastrería JTH vía WhatsApp"
        >
          <img
            src={`${import.meta.env.BASE_URL}logo-sastreria.svg`}
            alt="Sastrería a Domicilio JTH - Logo Oficial"
            referrerPolicy="no-referrer"
            className="w-full max-w-[380px] sm:max-w-[420px] h-auto drop-shadow-sm mx-auto"
          />
        </a>

        {/* Caption & quick WhatsApp action */}
        {showPhone && (
          <div className="mt-4 pt-3 border-t border-amber-100/80 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Taller de Sastrería &amp; Modistería Fina
            </span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Hola Jose Tiberio, deseo asesoría para un arreglo o confección a domicilio en Bogotá.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition border border-emerald-200 text-xs"
            >
              <span>Chatear al +57 319 278 7603</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
