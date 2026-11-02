import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Send, ArrowRight } from 'lucide-react';
import { formatCOP } from '../utils/formatters';

export const FloatingCartButton: React.FC = () => {
  const { cartItems, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, activeView } = useApp();

  // If cart is empty or drawer is open or we are already inside the wizard, don't obstruct
  if (cartItems.length === 0 || isCartOpen) return null;

  return (
    <div
      id="floating-cart-banner"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-5 duration-300"
    >
      <button
        type="button"
        id="btn-open-cart-floating"
        onClick={() => setIsCartOpen(true)}
        className="flex items-center gap-3 bg-blue-950 hover:bg-blue-900 text-white pl-4 pr-5 py-3 rounded-2xl shadow-2xl shadow-blue-950/40 border border-amber-400/40 group active:scale-95 transition-all"
        title="Ver carrito y enviar solicitud por WhatsApp"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-blue-950">
            {cartCount}
          </span>
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">Carrito</span>
            <span className="text-[11px] font-semibold text-amber-300">
              {formatCOP(cartSubtotal)}
            </span>
          </div>
          <span className="text-xs font-black text-emerald-400 uppercase tracking-tight flex items-center gap-1">
            <span>Enviar Solicitud</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </button>
    </div>
  );
};
