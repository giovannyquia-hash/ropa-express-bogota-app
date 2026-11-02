import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  MessageCircle,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Search,
  Bell,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    setAuthModalOpen,
    startOrderWithService,
    openWhatsApp,
    setIsChatOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    viewTrackingOrder,
    cartCount,
    setIsCartOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNavClick = (view: any) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setShowNotifications(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Subtitle */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-white border border-amber-200/90 shadow-sm p-1 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}logo-sastreria.svg`}
                alt="Logo Sastrería JTH"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-blue-950 font-serif">
                  SASTRERÍA
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/70 tracking-wider">
                  JTH
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 tracking-wider hidden sm:inline-block">
                  BOGOTÁ
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block leading-tight mt-0.5">
                Sastrería a domicilio, lavado y planchado profesional
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              id="nav-inicio"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'home'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              Inicio
            </button>
            <button
              id="nav-servicios"
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'services'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              Servicios
            </button>
            <button
              id="nav-como-funciona"
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'how-it-works'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              Cómo funciona
            </button>
            <button
              id="nav-precios"
              onClick={() => handleNavClick('pricing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'pricing'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              Precios
            </button>
            <button
              id="nav-tracking"
              onClick={() => handleNavClick('tracking')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeView === 'tracking'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Seguimiento
            </button>
            <button
              id="nav-mis-pedidos"
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'text-sky-700 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
              Mis pedidos
            </button>

            {currentUser?.role === 'admin' && (
              <button
                id="nav-admin"
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  activeView === 'admin'
                    ? 'text-indigo-700 bg-indigo-50 font-semibold ring-1 ring-indigo-200'
                    : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Quick Button */}
            <button
              id="btn-whatsapp-header"
              onClick={() => openWhatsApp()}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
              title="Hablar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* AI Assistant Chat Quick Toggle */}
            <button
              id="btn-assistant-header"
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-xl transition border border-sky-200"
              title="Asistente con IA"
            >
              <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
              <span className="hidden md:inline font-semibold">IA Asistente</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications-header"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-950 hover:bg-slate-100 transition"
                title="Notificaciones de pedidos"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Notificaciones
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {notifications.length} en total
                    </span>
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No tienes notificaciones pendientes.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`pt-2.5 first:pt-0 flex flex-col gap-1 p-2 rounded-xl transition ${
                            !notif.read ? 'bg-sky-50/70 border border-sky-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-blue-950">
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <button
                                onClick={() => markNotificationAsRead(notif.id)}
                                title="Marcar como leída"
                                className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold"
                              >
                                Marcar leída
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-1 pt-1 text-[10px] text-slate-400">
                            <span>{new Date(notif.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                            {notif.orderId && (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  viewTrackingOrder(notif.orderId!);
                                }}
                                className="font-semibold text-sky-700 hover:underline"
                              >
                                Ver pedido {notif.orderId} →
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User / Login button */}
            <button
              id="btn-auth-header"
              onClick={() => {
                if (currentUser) {
                  handleNavClick('dashboard');
                } else {
                  setAuthModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-950 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.name.split(' ')[0] : 'Iniciar sesión'}
              </span>
            </button>

            {/* Carrito de Servicios Quick Button */}
            <button
              id="btn-cart-header"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 transition shadow-sm border border-amber-500/40"
              title="Abrir Carrito y Enviar Solicitud"
            >
              <ShoppingCart className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CTA: Solicitar servicio */}
            <button
              id="btn-cta-header"
              onClick={() => startOrderWithService()}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 shadow-md shadow-blue-950/20 active:scale-95 transition-all"
            >
              Solicitar servicio
            </button>

            {/* Mobile hamburger menu toggle */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-950 hover:bg-slate-100 transition"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-1.5 shadow-xl animate-in slide-in-from-top-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsCartOpen(true);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between border border-amber-200"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span>Ver Carrito de Servicios</span>
            </span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                {cartCount} ítems
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Servicios
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Precios
          </button>
          <button
            onClick={() => handleNavClick('tracking')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Seguimiento de pedido
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-800"
          >
            Mis pedidos & Perfil
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
          >
            Panel Administrativo
          </button>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                openWhatsApp();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Contactar por WhatsApp
            </button>
            <button
              onClick={() => {
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
            >
              {currentUser ? `Conectado como: ${currentUser.name}` : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
