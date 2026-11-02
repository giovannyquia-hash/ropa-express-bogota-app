import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Truck,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  Send,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { formatCOP, generateOrderId } from '../utils/formatters';
import { whatsappService, OrderState, CustomerInfo, GarmentItem } from '../services/whatsappService';
import { api } from '../services/api';
import { WhatsAppReadyModal } from './WhatsAppReadyModal';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartCount,
    cartSubtotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    deliveryZones,
    currentUser,
    addToast,
    refreshOrders,
    setActiveView,
    viewTrackingOrder,
  } = useApp();

  // Quick Customer State for the Cart
  const [customer, setCustomer] = useState<CustomerInfo>(() => ({
    name: currentUser?.name || 'Carlos Mendoza',
    phone: currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '3104567890',
    email: currentUser?.email || 'carlos.mendoza@ejemplo.com',
    address: 'Carrera 15 # 85-30',
    neighborhood: 'Antiguo Country',
    locality: 'Chapinero',
    pickupNotes: 'Dejar en portería o llamar al timbre.',
  }));

  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('8:00 a.m. - 10:00 a.m.');
  const [generalObservations, setGeneralObservations] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isReadyModalOpen, setIsReadyModalOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<OrderState | null>(null);

  // Delivery fee based on selected locality
  const deliveryFee = useMemo<number | 'GRATIS' | 'PENDING'>(() => {
    if (!customer.locality || customer.locality.trim() === '') return 5000;
    const zone = deliveryZones.find(
      (z) => z.locality.toLowerCase().trim() === customer.locality.toLowerCase().trim()
    );
    if (zone) {
      return zone.deliveryFee === 0 ? 'GRATIS' : zone.deliveryFee;
    }
    return 5000;
  }, [customer.locality, deliveryZones]);

  const deliveryNumber = typeof deliveryFee === 'number' ? deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryNumber;

  // Build the order object for WhatsApp validation & sending
  const currentOrder: OrderState = useMemo(() => {
    const garmentItems: GarmentItem[] = cartItems.map((it) => ({
      id: it.id,
      garmentType: it.garmentType || 'Prenda',
      service: it.serviceName || 'Arreglo general',
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
      description: it.description || '',
      isEstimate: it.isEstimate ?? true,
      unit: it.unit || 'Prenda',
      photos: [],
    }));

    return {
      id: generateOrderId(),
      customer,
      items: garmentItems,
      subtotal: cartSubtotal,
      deliveryFee,
      additionalCharges: 0,
      discount: 0,
      total: cartTotal,
      requestDate: new Date().toLocaleDateString('es-CO'),
      requestTime: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      pickupDate,
      pickupTimeSlot,
      generalObservations,
      hasEstimates: cartItems.some((it) => it.isEstimate),
    };
  }, [cartItems, customer, cartSubtotal, deliveryFee, cartTotal, pickupDate, pickupTimeSlot, generalObservations]);

  // Validation
  const validation = useMemo(() => {
    return whatsappService.validateOrder(currentOrder);
  }, [currentOrder]);

  // Direct Submit Handler
  const handleSendFullRequest = async () => {
    if (cartItems.length === 0) {
      addToast({
        type: 'error',
        title: 'Carrito vacío',
        message: 'Agrega al menos un servicio antes de enviar.',
      });
      return;
    }

    if (!validation.valid) {
      addToast({
        type: 'error',
        title: 'Faltan datos para enviar',
        message: validation.errors[0] || 'Por favor completa todos los campos de recogida.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save in backend
      const payload = {
        id: currentOrder.id,
        userId: currentUser?.id || 'usr-guest',
        customerName: currentOrder.customer.name,
        customerPhone: currentOrder.customer.phone,
        customerEmail: currentOrder.customer.email,
        address: {
          address: currentOrder.customer.address,
          neighborhood: currentOrder.customer.neighborhood,
          locality: currentOrder.customer.locality,
          notes: currentOrder.customer.pickupNotes || '',
        },
        items: currentOrder.items.map((it) => ({
          serviceName: `${it.garmentType} - ${it.service}`,
          garmentType: it.garmentType,
          alterationType: it.service,
          description: it.description || '',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          isEstimate: it.isEstimate,
        })),
        pickupDate: currentOrder.pickupDate,
        pickupTime: currentOrder.pickupTimeSlot,
        deliveryFee: deliveryNumber,
        subtotal: currentOrder.subtotal,
        total: currentOrder.total,
        notes: currentOrder.generalObservations,
      };

      try {
        await api.createOrder(payload);
        await refreshOrders();
      } catch (e) {
        console.warn('Registro local persistido:', e);
      }

      setCompletedOrder(currentOrder);

      // 2. Open WhatsApp directly with the pre-formatted text
      const url = whatsappService.getWhatsAppUrl(currentOrder);
      window.open(url, '_blank');

      // 3. Show confirmation modal
      setIsReadyModalOpen(true);
      setIsCartOpen(false);

      addToast({
        type: 'success',
        title: '¡Solicitud enviada a WhatsApp!',
        message: `Pedido ${currentOrder.id} por ${formatCOP(currentOrder.total)} enviado a Ropa Express.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al enviar solicitud',
        message: err.message || 'Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetailedWizard = () => {
    setIsCartOpen(false);
    setActiveView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight">Carrito de Servicios</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {cartCount} {cartCount === 1 ? 'servicio' : 'servicios'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Revisa tus prendas y envía la solicitud completa por WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-rose-300 p-1.5 transition"
                    title="Vaciar todo el carrito"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Empty state */}
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Tu carrito está vacío</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Añade servicios desde el catálogo de sastrería, lavado o planchado.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveView('services');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 transition shadow-sm"
                  >
                    Explorar servicios disponibles
                  </button>
                </div>
              ) : (
                <>
                  {/* SECCIÓN 1: SERVICIOS Y PRENDAS AGREGADAS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        <span>Prendas & Arreglos Seleccionados</span>
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        Subtotal: <strong className="text-slate-900">{formatCOP(cartSubtotal)}</strong>
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-xs">
                      {cartItems.map((item, idx) => (
                        <div key={item.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-blue-950">
                                  {idx + 1}. {item.garmentType}
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs font-semibold text-sky-800">
                                  {item.serviceName}
                                </span>
                                {item.isEstimate && (
                                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                                    Estimado
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Precio unitario: {formatCOP(item.unitPrice)} COP
                              </p>
                              {item.description && (
                                <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  "{item.description}"
                                </p>
                              )}
                            </div>

                            {/* Subtotal of this item */}
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-black text-slate-900">
                                {formatCOP(item.subtotal)}
                              </span>
                            </div>
                          </div>

                          {/* Controls: Quantity + Remove */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 shadow-xs transition"
                                title="Disminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-extrabold text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 shadow-xs transition"
                                title="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECCIÓN 2: DATOS RÁPIDOS DE CONTACTO Y RECOGIDA */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        <span>Datos de Recogida en Bogotá</span>
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Puerta a puerta
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nombre completo:
                        </label>
                        <input
                          type="text"
                          value={customer.name}
                          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                          placeholder="Tu nombre completo"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          WhatsApp de contacto:
                        </label>
                        <input
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="Ej. 3001234567"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Dirección de recogida (Bogotá):
                        </label>
                        <input
                          type="text"
                          value={customer.address}
                          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                          placeholder="Calle 10 # 20-30, Apto o Casa"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Barrio:
                        </label>
                        <input
                          type="text"
                          value={customer.neighborhood}
                          onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                          placeholder="Ej. Chapinero Alto, Cedritos..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Localidad (Tarifa de domicilio):
                        </label>
                        <select
                          value={customer.locality}
                          onChange={(e) => setCustomer({ ...customer, locality: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          {deliveryZones.map((z) => (
                            <option key={z.id} value={z.locality}>
                              {z.locality} ({z.deliveryFee === 0 ? 'Domicilio GRATIS' : `$${z.deliveryFee.toLocaleString('es-CO')}`})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Fecha de recogida:
                        </label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Horario de recogida:
                        </label>
                        <select
                          value={pickupTimeSlot}
                          onChange={(e) => setPickupTimeSlot(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="8:00 a.m. - 10:00 a.m.">Mañana: 8:00 a.m. - 10:00 a.m.</option>
                          <option value="10:00 a.m. - 12:00 m.">Mañana: 10:00 a.m. - 12:00 m.</option>
                          <option value="2:00 p.m. - 4:00 p.m.">Tarde: 2:00 p.m. - 4:00 p.m.</option>
                          <option value="4:00 p.m. - 6:00 p.m.">Tarde: 4:00 p.m. - 6:00 p.m.</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: DESGLOSE DE COSTOS */}
                  <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal Servicios ({cartCount} ítems):</span>
                      <span className="font-bold text-slate-900">{formatCOP(cartSubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Domicilio ({customer.locality}):</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {deliveryFee === 0 || deliveryFee === 'GRATIS' ? 'GRATIS' : formatCOP(deliveryNumber)}
                      </span>
                    </div>

                    {/* Total Gran Destacado */}
                    <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-baseline justify-between mt-3">
                      <div>
                        <span className="text-xs font-extrabold uppercase text-blue-950 block">
                          TOTAL A CONFIRMAR:
                        </span>
                        <span className="text-[10px] text-slate-500">Servicios + Domicilio Bogotá</span>
                      </div>
                      <span className="text-2xl font-black text-sky-950 tracking-tight">
                        {formatCOP(cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Validation errors warning if any */}
                  {!validation.valid && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Para enviar completa los datos:</p>
                        <p>{validation.errors[0]}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer con el BOTÓN CLARO PARA ENVIAR */}
            {cartItems.length > 0 && (
              <div className="p-5 sm:p-6 bg-white border-t border-slate-200 space-y-3 shadow-lg">
                {/* BOTÓN PRINCIPAL ULTRA CLARO */}
                <button
                  id="btn-cart-send-whatsapp"
                  onClick={handleSendFullRequest}
                  disabled={isSubmitting || !validation.valid}
                  className="w-full py-4 px-6 rounded-2xl text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-700/25 flex flex-col sm:flex-row items-center justify-center gap-2 group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 fill-white stroke-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="tracking-tight text-white uppercase text-sm sm:text-base font-black">
                      ENVIAR TODA ESTA SOLICITUD POR WHATSAPP
                    </span>
                  </div>
                  <span className="bg-emerald-800/60 text-emerald-100 text-xs px-2.5 py-1 rounded-full font-bold">
                    {formatCOP(cartTotal)}
                  </span>
                </button>

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sin pago por adelantado. Se paga contra entrega o transferencia.</span>
                </p>

                {/* Opción secundaria: ir al asistente paso a paso para fotos o medidas */}
                <button
                  onClick={handleOpenDetailedWizard}
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-700 hover:text-blue-950 hover:bg-slate-100 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>¿Deseas adjuntar fotos o medidas específicas? Abrir formulario detallado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal when submitted */}
      {completedOrder && (
        <WhatsAppReadyModal
          order={completedOrder}
          isOpen={isReadyModalOpen}
          onClose={() => setIsReadyModalOpen(false)}
          onFinishAndTrack={() => {
            setIsReadyModalOpen(false);
            viewTrackingOrder(completedOrder.id);
          }}
        />
      )}
    </>
  );
};
