import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Address, Order } from '../types';
import { ORDER_STATUS_LABELS } from '../config/constants';
import { api } from '../services/api';
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Home,
  Briefcase,
  Layers,
  ChevronRight,
  Bell
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    orders,
    refreshOrders,
    viewTrackingOrder,
    startOrderWithService,
    setAuthModalOpen,
    addToast,
    notifications,
    markNotificationAsRead,
  } = useApp();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [newAddressModal, setNewAddressModal] = useState<boolean>(false);
  const [newAddrName, setNewAddrName] = useState<string>('Casa');
  const [newAddrText, setNewAddrText] = useState<string>('');
  const [newAddrLocality, setNewAddrLocality] = useState<string>('Chapinero');
  const [newAddrNeighborhood, setNewAddrNeighborhood] = useState<string>('');
  const [newAddrNotes, setNewAddrNotes] = useState<string>('');

  useEffect(() => {
    if (currentUser?.id) {
      api.getUserAddresses(currentUser.id)
        .then((res) => setSavedAddresses(res))
        .catch(() => {});
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-blue-950">Inicia sesión</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6">
          Accede para ver tu historial de pedidos, seguimiento y direcciones guardadas.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full py-3.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm shadow-md"
        >
          Iniciar sesión o Registrarse
        </button>
      </div>
    );
  }

  // Filter orders for current user
  const myOrders = orders.filter((o) => o.userId === currentUser.id || currentUser.role === 'admin');
  const activeOrder = myOrders.find((o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO') || myOrders[0];

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;

    try {
      const added = await api.saveAddress(currentUser.id, {
        name: newAddrName,
        address: newAddrText,
        neighborhood: newAddrNeighborhood,
        locality: newAddrLocality,
        notes: newAddrNotes,
      });
      setSavedAddresses((prev) => [...prev, added]);
      setNewAddressModal(false);
      setNewAddrText('');
      setNewAddrNotes('');
      addToast({
        title: 'Dirección guardada',
        message: 'Tu dirección quedó disponible para tus pedidos.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error al guardar',
        message: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 space-y-10">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-black shadow-md">
            {currentUser.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Panel de Usuario</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hola, {currentUser.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.email} • {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => startOrderWithService()}
            className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-blue-950 text-xs font-extrabold shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar nuevo servicio</span>
          </button>

          <button
            onClick={() => refreshOrders()}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            title="Actualizar pedidos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Active Order + Saved Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Order Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-bold text-blue-950">Pedido Actual</h2>
            </div>

            {activeOrder && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                {ORDER_STATUS_LABELS[activeOrder.status]}
              </span>
            )}
          </div>

          {activeOrder ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500">{activeOrder.id}</span>
                  <p className="text-sm font-bold text-blue-950 mt-0.5">
                    {activeOrder.items.length} prendas ({activeOrder.items.map((i) => i.serviceName).join(', ')})
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Recogida: {activeOrder.pickupDate} ({activeOrder.pickupTime})
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">Total</span>
                  <span className="text-lg font-extrabold text-blue-950">
                    ${activeOrder.total.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => viewTrackingOrder(activeOrder.id)}
                  className="flex-1 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Ver seguimiento en vivo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => startOrderWithService()}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Repetir pedido
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No tienes ningún pedido activo en este momento.</p>
              <button
                onClick={() => startOrderWithService()}
                className="mt-4 px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition"
              >
                Crear tu primer pedido
              </button>
            </div>
          )}
        </div>

        {/* Saved Addresses Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-bold text-blue-950">Direcciones Guardadas</h2>
            </div>

            <button
              onClick={() => setNewAddressModal(true)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {savedAddresses.map((addr) => {
              const isHome = addr.name.toLowerCase().includes('casa') || addr.name.toLowerCase().includes('apto');
              return (
                <div key={addr.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {isHome ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-blue-950">{addr.name}</span>
                    <p className="text-xs text-slate-700 font-medium truncate">{addr.address}</p>
                    <p className="text-[11px] text-slate-500">
                      {addr.neighborhood ? `${addr.neighborhood}, ` : ''}{addr.locality}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-600" />
              <span>Avisos y Notificaciones de Estado ({notifications.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sincronizado vía WhatsApp & App</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  !n.read ? 'bg-sky-50/70 border-sky-200' : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950">{n.title}</span>
                    {!n.read && (
                      <button
                        onClick={() => markNotificationAsRead(n.id)}
                        className="text-[10px] font-bold text-sky-700 hover:text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md"
                      >
                        Marcar leída
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{n.message}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(n.createdAt).toLocaleDateString('es-CO')} {new Date(n.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.orderId && (
                    <button
                      onClick={() => viewTrackingOrder(n.orderId!)}
                      className="font-bold text-sky-700 hover:text-sky-900"
                    >
                      Ver pedido {n.orderId} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-blue-950 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <span>Historial de Pedidos ({myOrders.length})</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Código</th>
                <th className="pb-3">Fecha</th>
                <th className="pb-3">Servicio / Prendas</th>
                <th className="pb-3">Localidad</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Total</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 font-mono font-bold text-blue-950">{ord.id}</td>
                  <td className="py-4 text-slate-600">{ord.pickupDate}</td>
                  <td className="py-4">
                    <span className="font-semibold text-slate-900 block">{ord.items.length} prendas</span>
                    <span className="text-slate-500 text-[11px]">
                      {ord.items[0]?.serviceName}
                      {ord.items.length > 1 ? ` +${ord.items.length - 1}` : ''}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600">{ord.address.locality}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      {ORDER_STATUS_LABELS[ord.status]}
                    </span>
                  </td>
                  <td className="py-4 font-extrabold text-slate-900">${ord.total.toLocaleString('es-CO')}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => viewTrackingOrder(ord.id)}
                      className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold"
                    >
                      <span>Ver</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Address Modal */}
      {newAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-blue-950">Guardar nueva dirección</h3>

            <form onSubmit={handleSaveNewAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre (Etiqueta):</label>
                <input
                  type="text"
                  placeholder="Ej. Casa, Oficina, Casa de mis padres"
                  value={newAddrName}
                  onChange={(e) => setNewAddrName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección exacta:</label>
                <input
                  type="text"
                  placeholder="Ej. Carrera 15 # 140-22 Apto 301"
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Localidad:</label>
                  <select
                    value={newAddrLocality}
                    onChange={(e) => setNewAddrLocality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium"
                  >
                    <option value="Chapinero">Chapinero</option>
                    <option value="Usaquén">Usaquén</option>
                    <option value="Suba">Suba</option>
                    <option value="Teusaquillo">Teusaquillo</option>
                    <option value="Barrios Unidos">Barrios Unidos</option>
                    <option value="Santa Fe">Santa Fe</option>
                    <option value="Fontibón">Fontibón</option>
                    <option value="Engativá">Engativá</option>
                    <option value="Kennedy">Kennedy</option>
                    <option value="Puente Aranda">Puente Aranda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Barrio:</label>
                  <input
                    type="text"
                    placeholder="Ej. Cedritos"
                    value={newAddrNeighborhood}
                    onChange={(e) => setNewAddrNeighborhood(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Indicaciones:</label>
                <input
                  type="text"
                  placeholder="Ej. Timbre 301, portería"
                  value={newAddrNotes}
                  onChange={(e) => setNewAddrNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewAddressModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900"
                >
                  Guardar dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
