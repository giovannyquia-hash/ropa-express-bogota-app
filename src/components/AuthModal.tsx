import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../config/constants';
import { api } from '../services/api';
import { X, User, Lock, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, currentUser, setCurrentUser, addToast, setActiveView } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.loginUser({
        email,
        name: name || undefined,
        phone: phone || undefined,
      });
      setCurrentUser(res.user);
      setAuthModalOpen(false);
      addToast({
        title: '¡Sesión iniciada!',
        message: `Bienvenido a Ropa Express, ${res.user.name}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error de autenticación',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (usr: any) => {
    setCurrentUser(usr);
    setAuthModalOpen(false);
    addToast({
      title: 'Usuario cambiado',
      message: `Conectado como ${usr.name} (${usr.role === 'admin' ? 'Administrador' : 'Cliente'}).`,
      type: 'info',
    });
    if (usr.role === 'admin') {
      setActiveView('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
        {/* Close */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
            Ropa Express Bogotá
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-blue-950 mt-2">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona tus pedidos a domicilio, repite órdenes y guarda tus direcciones de Bogotá.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono / WhatsApp:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="+57 310 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{mode === 'login' ? 'Entrar a mi cuenta' : 'Completar registro'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-sky-700 hover:underline"
              >
                Regístrate gratis
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-sky-700 hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          )}
        </div>

        {/* Demo Users Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Acceso Rápido para Pruebas:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => selectDemoUser(DEMO_USERS[1])}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50 text-left transition"
            >
              <span className="font-bold text-xs text-blue-950 block">Carlos Mendoza</span>
              <span className="text-[10px] text-slate-500">Cliente Bogotá</span>
            </button>

            <button
              type="button"
              onClick={() => selectDemoUser(DEMO_USERS[0])}
              className="p-2.5 rounded-xl border border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 text-left transition"
            >
              <div className="flex items-center gap-1 font-bold text-xs text-indigo-950">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Ops</span>
              </div>
              <span className="text-[10px] text-indigo-700">Panel Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
