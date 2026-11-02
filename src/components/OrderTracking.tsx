import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { ORDER_STATUS_SEQUENCE, ORDER_STATUS_LABELS } from '../config/constants';
import { api } from '../services/api';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  MessageCircle,
  Package,
  AlertCircle,
  Truck,
  RotateCcw
} from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { trackingId, setTrackingId, orders, shareOrderOnWhatsApp, addToast } = useApp();
  const [searchInput, setSearchInput] = useState<string>(trackingId || 'RE-2026-000101');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrder = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const ord = await api.getOrderById(idToSearch.trim());
      setCurrentOrder(ord);
      setTrackingId(ord.id);
    } catch (err: any) {
      // Look in local orders state as fallback
      const local = orders.find((o) => o.id.toUpperCase() === idToSearch.trim().toUpperCase());
      if (local) {
        setCurrentOrder(local);
      } else {
        setCurrentOrder(null);
        setErrorMessage('No encontramos ningún pedido con este código. Revisa que esté bien escrito.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      setSearchInput(trackingId);
      fetchOrder(trackingId);
    }
  }, [trackingId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchInput);
  };

  const getStatusIndex = (status: OrderStatus) => {
    return ORDER_STATUS_SEQUENCE.indexOf(status);
  };

  const currentStatusIdx = currentOrder ? getStatusIndex(currentOrder.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
          En Tiempo Real
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
          Seguimiento de Pedido
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Consulta en qué etapa se encuentra tu ropa: recogida, lavado, planchado, arreglos o entrega a domicilio.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-10">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-xs">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Ingresa tu código de pedido (ej: RE-2026-000101)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-32 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-blue-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {/* Quick Demo Pickers */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">Códigos de prueba:</span>
          {['RE-2026-000101', 'RE-2026-000102', 'RE-2026-000103'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchInput(code);
                fetchOrder(code);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-sky-100 hover:text-sky-900 font-mono text-slate-700 transition"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 max-w-xl mx-auto flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-xs">{errorMessage}</p>
        </div>
      )}

      {/* Order Display */}
      {currentOrder && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in">
          {/* Header of order */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Código de Pedido</span>
              <h2 className="text-2xl font-mono font-extrabold tracking-wide mt-0.5">{currentOrder.id}</h2>
              <p className="text-xs text-slate-300 mt-1">
                Cliente: <span className="font-semibold text-white">{currentOrder.customerName}</span> • Registrado el{' '}
                {new Date(currentOrder.createdAt).toLocaleDateString('es-CO')}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-300">Total a pagar:</span>
              <p className="text-2xl font-black text-sky-300">${currentOrder.total.toLocaleString('es-CO')} COP</p>
              <button
                onClick={() => shareOrderOnWhatsApp(currentOrder)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Compartir por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Timeline Visual Status */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
              Línea de tiempo del servicio:
            </h3>

            {/* Steps Timeline sequence */}
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
                {ORDER_STATUS_SEQUENCE.map((st, idx) => {
                  const isCompleted = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;

                  let circleClass = 'bg-slate-200 text-slate-400 border-slate-300';
                  if (isCurrent) {
                    circleClass = 'bg-sky-600 text-white border-sky-600 ring-4 ring-sky-100 animate-pulse';
                  } else if (isCompleted) {
                    circleClass = 'bg-emerald-600 text-white border-emerald-600';
                  }

                  return (
                    <div key={st} className="flex flex-col items-center text-center p-1">
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold transition shadow-xs ${circleClass}`}
                      >
                        {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] mt-1.5 font-bold leading-tight line-clamp-2 ${
                          isCurrent ? 'text-sky-700 font-extrabold' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[st]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current status highlighted alert */}
            <div className="mt-8 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Estado actual: {ORDER_STATUS_LABELS[currentOrder.status]}</h4>
                  <p className="text-xs text-sky-800">
                    {currentOrder.history[currentOrder.history.length - 1]?.comment ||
                      'En proceso de atención en taller de Bogotá.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Garments List */}
            <div>
              <h4 className="text-sm font-bold text-blue-950 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" />
                <span>Prendas en el pedido ({currentOrder.items.length})</span>
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                {currentOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-slate-800">
                        {it.quantity}x {it.garmentType || it.serviceName}
                      </p>
                      <p className="text-xs text-slate-500">{it.description}</p>
                    </div>
                    <span className="font-bold text-slate-900">${it.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>

              {/* Extra charge if any */}
              {currentOrder.extraCharge ? (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <span className="font-bold">Costo adicional de taller:</span> $
                  {currentOrder.extraCharge.toLocaleString('es-CO')} COP
                </div>
              ) : null}
            </div>

            {/* Recogida and Domicilio info */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Dirección de recogida en Bogotá</span>
                </h4>
                <p className="font-semibold text-slate-900">{currentOrder.address.address}</p>
                <p className="text-slate-500">
                  {currentOrder.address.neighborhood ? `${currentOrder.address.neighborhood}, ` : ''}
                  {currentOrder.address.locality}
                </p>
                {currentOrder.address.notes && (
                  <p className="text-slate-500 italic mt-1">"{currentOrder.address.notes}"</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Programación de recogida</span>
                </h4>
                <p className="font-semibold text-slate-900">Fecha: {currentOrder.pickupDate}</p>
                <p className="text-slate-500">Franja: {currentOrder.pickupTime}</p>
              </div>

              {/* History timeline list */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-2">
                  Bitácora de movimientos:
                </h4>
                <div className="space-y-2">
                  {currentOrder.history.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between gap-2">
                      <div>
                        <span className="font-bold text-blue-950">{ORDER_STATUS_LABELS[h.status]}</span>
                        <p className="text-slate-500">{h.comment}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(h.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
