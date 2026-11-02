import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Layers, ShoppingBag, Sparkles, ShoppingCart, User as UserIcon } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, setIsChatOpen, setAuthModalOpen, currentUser, cartCount, setIsCartOpen } = useApp();

  const handleNav = (view: any) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg"
    >
      <button
        onClick={() => handleNav('home')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] ${
          activeView === 'home' ? 'text-sky-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className={`w-5 h-5 ${activeView === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-0.5">Inicio</span>
      </button>

      <button
        onClick={() => handleNav('services')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] ${
          activeView === 'services' ? 'text-sky-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Layers className={`w-5 h-5 ${activeView === 'services' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-0.5">Servicios</span>
      </button>

      {/* Botón Carrito en Mobile */}
      <button
        id="bottom-nav-cart"
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] relative text-amber-700 hover:text-amber-900"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 stroke-[2.5px] text-amber-600" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-blue-950 text-white text-[9px] font-black flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5 font-bold">Carrito</span>
      </button>

      <button
        onClick={() => handleNav('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] ${
          activeView === 'dashboard' ? 'text-sky-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <ShoppingBag className={`w-5 h-5 ${activeView === 'dashboard' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[11px] mt-0.5">Pedidos</span>
      </button>

      <button
        onClick={() => setIsChatOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-sky-600 hover:text-sky-800 transition min-w-[56px] relative"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 stroke-2 text-sky-600 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
        <span className="text-[11px] mt-0.5 font-medium">Chat IA</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            handleNav('dashboard');
          } else {
            setAuthModalOpen(true);
          }
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition min-w-[56px] ${
          activeView === 'dashboard' ? 'text-sky-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <UserIcon className="w-5 h-5 stroke-2" />
        <span className="text-[11px] mt-0.5">Perfil</span>
      </button>
    </nav>
  );
};
