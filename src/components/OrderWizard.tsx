import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerContactForm } from './CustomerContactForm';
import { GarmentsForm } from './GarmentsForm';
import { OrderCalculatorCard } from './OrderCalculatorCard';
import { OrderReviewView } from './OrderReviewView';
import { WhatsAppReadyModal } from './WhatsAppReadyModal';
import { OrderState, CustomerInfo, GarmentItem, whatsappService } from '../services/whatsappService';
import { formatCOP, generateOrderId } from '../utils/formatters';
import { api } from '../services/api';
import { getCatalogServiceDetails } from '../services/catalogService';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ShoppingBag,
  Send,
  MessageCircle,
  TestTube,
} from 'lucide-react';

export const OrderWizard: React.FC = () => {
  const {
    currentUser,
    services,
    deliveryZones,
    addToast,
    refreshOrders,
    viewTrackingOrder,
    setActiveView,
    preselectedServiceId,
    cartItems,
    cartCount,
    setIsCartOpen,
  } = useApp();

  // Wizard mode: 'form' (editing steps 1-7) | 'review' (step 8)
  const [wizardMode, setWizardMode] = useState<'form' | 'review'>('form');
  const [isReadyModalOpen, setIsReadyModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Persistent Order ID
  const [orderId, setOrderId] = useState<string>(() => generateOrderId());

  // Customer State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: currentUser?.name || '',
    phone: currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '',
    email: currentUser?.email || '',
    address: '',
    neighborhood: '',
    locality: 'Chapinero',
    pickupNotes: '',
  });

  // Scheduling State
  const [pickupDate, setPickupDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('8:00 a.m. - 10:00 a.m.');
  const [generalObservations, setGeneralObservations] = useState<string>('');

  // Garment Items State (single source of truth for garments, initialized from cart if present)
  const [items, setItems] = useState<GarmentItem[]>(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.map((c, i) => ({
        id: c.id || `item-${i + 1}`,
        garmentType: c.garmentType || 'Prenda',
        service: c.serviceName || 'Arreglo general',
        description: c.description || '',
        quantity: c.quantity || 1,
        unitPrice: c.unitPrice || 0,
        subtotal: c.subtotal || ((c.quantity || 1) * (c.unitPrice || 0)),
        photos: [],
        isEstimate: c.isEstimate ?? true,
        unit: c.unit || 'Prenda',
      }));
    }
    const defaultDetails = getCatalogServiceDetails('Pantalón', 'Dobladillo', services);
    return [
      {
        id: 'item-1',
        garmentType: 'Pantalón',
        service: 'Dobladillo',
        description: 'Necesito reducir 5 cm.',
        quantity: 1,
        unitPrice: defaultDetails.unitPrice,
        subtotal: defaultDetails.unitPrice * 1,
        photos: [],
        isEstimate: defaultDetails.isEstimate,
        unit: defaultDetails.unit,
      },
    ];
  });

  // Touched state for customer form validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Recalcular el domicilio según localidad seleccionada
  const deliveryFee = useMemo<number | 'GRATIS' | 'PENDING'>(() => {
    if (!customer.locality || customer.locality.trim() === '') {
      return 'PENDING';
    }
    const zone = deliveryZones.find(
      (z) => z.locality.toLowerCase().trim() === customer.locality.toLowerCase().trim()
    );
    if (zone) {
      return zone.deliveryFee === 0 ? 'GRATIS' : zone.deliveryFee;
    }
    // Domicilio estándar en Bogotá si no está en zonas específicas
    return 5000;
  }, [customer.locality, deliveryZones]);

  // Cálculos en tiempo real según la fórmula estricta:
  // subtotalItem = quantity × unitPrice
  // subtotal = Σ subtotalItem
  // total = subtotal + deliveryFee + additionalCharges - discount
  const orderSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  }, [items]);

  const orderTotal = useMemo(() => {
    const feeNumber = typeof deliveryFee === 'number' ? deliveryFee : 0;
    return orderSubtotal + feeNumber;
  }, [orderSubtotal, deliveryFee]);

  const hasEstimates = useMemo(() => {
    return items.some((it) => it.isEstimate);
  }, [items]);

  // Construir el objeto order (FUENTE ÚNICA DE VERDAD)
  const currentOrder: OrderState = useMemo(() => {
    return {
      id: orderId,
      customer,
      items,
      subtotal: orderSubtotal,
      deliveryFee,
      additionalCharges: 0,
      discount: 0,
      total: orderTotal,
      requestDate: new Date().toLocaleDateString('es-CO'),
      requestTime: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      pickupDate,
      pickupTimeSlot,
      generalObservations,
      hasEstimates,
    };
  }, [
    orderId,
    customer,
    items,
    orderSubtotal,
    deliveryFee,
    orderTotal,
    pickupDate,
    pickupTimeSlot,
    generalObservations,
    hasEstimates,
  ]);

  // Validación en tiempo real del pedido
  const validation = useMemo(() => {
    return whatsappService.validateOrder(currentOrder);
  }, [currentOrder]);

  // Errores específicos de campos del cliente
  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!customer.name || customer.name.trim().length < 3) {
      errs.name = 'El nombre debe tener mínimo 3 caracteres.';
    }
    if (!customer.phone || customer.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Ingresa un número de WhatsApp válido (ej. 3001234567).';
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      errs.email = 'Ingresa un correo electrónico válido.';
    }
    if (!customer.address || customer.address.trim().length < 5) {
      errs.address = 'La dirección de recogida es obligatoria.';
    }
    if (!customer.neighborhood || customer.neighborhood.trim().length < 2) {
      errs.neighborhood = 'El barrio es obligatorio.';
    }
    if (!customer.locality || customer.locality.trim() === '') {
      errs.locality = 'Selecciona la localidad.';
    }
    return errs;
  }, [customer]);

  const handleBlurField = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Cargar caso de prueba obligatorio (Juan Pérez) con 1 clic
  const handleLoadTestCase = () => {
    setCustomer({
      name: 'Juan Pérez',
      phone: '3001234567',
      email: 'juan.perez@ejemplo.com',
      address: 'Calle 10 # 20-30',
      neighborhood: 'Centro',
      locality: 'Los Mártires',
      pickupNotes: 'Apartamento 302, citófono no funciona, favor llamar al celular.',
    });

    const pantalonDetails = getCatalogServiceDetails('Pantalón', 'Dobladillo', services);
    const camisaDetails = getCatalogServiceDetails('Camisa', 'Ajuste de manga', services);

    setItems([
      {
        id: 'item-test-1',
        garmentType: 'Pantalón',
        service: 'Dobladillo',
        quantity: 1,
        unitPrice: 8000,
        subtotal: 8000,
        description: 'Necesito reducir 5 cm.',
        photos: [],
        isEstimate: true,
      },
      {
        id: 'item-test-2',
        garmentType: 'Camisa',
        service: 'Ajuste de manga',
        quantity: 1,
        unitPrice: 10000,
        subtotal: 10000,
        description: 'Ajustar ambas mangas.',
        photos: [],
        isEstimate: true,
      },
    ]);

    setGeneralObservations('Servicio urgente para entrega este fin de semana.');

    addToast({
      type: 'info',
      title: 'Caso de prueba cargado',
      message: 'Pantalón ($8.000) + Camisa ($10.000) + Domicilio ($5.000) = Total $23.000',
    });
  };

  // Pasar a la pantalla de revisión (PASO 8)
  const handleProceedToReview = () => {
    // Marcar todos los campos como tocados para visibilizar cualquier error
    setTouched({
      name: true,
      phone: true,
      email: true,
      address: true,
      neighborhood: true,
      locality: true,
    });

    if (!validation.valid) {
      addToast({
        type: 'error',
        title: 'Faltan datos obligatorios',
        message: validation.errors[0] || 'Revisa los campos marcados en rojo.',
      });
      return;
    }

    setWizardMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Volver a la edición del pedido
  const handleBackToForm = () => {
    setWizardMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enviar pedido por WhatsApp y registrar en el sistema (PASO 9)
  const handleConfirmSendWhatsApp = async () => {
    setIsSubmitting(true);
    try {
      // 1. Validar estrictamente
      const check = whatsappService.validateOrder(currentOrder);
      if (!check.valid) {
        addToast({
          type: 'error',
          title: 'No se puede enviar',
          message: check.errors[0],
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Guardar en el backend para persistencia, métricas y trazabilidad
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
          photos: it.photos || [],
        })),
        pickupDate: currentOrder.pickupDate,
        pickupTime: currentOrder.pickupTimeSlot,
        deliveryFee: typeof currentOrder.deliveryFee === 'number' ? currentOrder.deliveryFee : 5000,
        subtotal: currentOrder.subtotal,
        total: currentOrder.total,
        notes: currentOrder.generalObservations,
      };

      try {
        await api.createOrder(payload);
        await refreshOrders();
      } catch (saveErr) {
        console.warn('Registro local persistido con éxito en cliente:', saveErr);
      }

      // 3. Abrir la ventana de confirmación y enviar directamente a WhatsApp
      const url = whatsappService.getWhatsAppUrl(currentOrder);
      window.open(url, '_blank');
      setIsReadyModalOpen(true);

      addToast({
        type: 'success',
        title: '¡Solicitud preparada exitosamente!',
        message: `Pedido ${currentOrder.id} listo para WhatsApp con total de ${formatCOP(currentOrder.total)}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al procesar solicitud',
        message: err.message || 'Inténtalo nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalizar y ver seguimiento
  const handleFinishAndTrack = () => {
    setIsReadyModalOpen(false);
    viewTrackingOrder(currentOrder.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-28 md:pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header con botón de volver y caso de prueba */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full">
                Sastrería y Arreglos
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
                Solicitar arreglo de ropa
              </h1>
            </div>
          </div>

          {/* Botón de Caso de Prueba Oficial */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-load-test-case"
              onClick={handleLoadTestCase}
              className="text-xs font-bold text-sky-900 bg-white hover:bg-sky-50 border border-sky-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs"
              title="Cargar automáticamente el caso de prueba: Juan Pérez (Pantalón + Camisa = $23.000)"
            >
              <TestTube className="w-4 h-4 text-sky-600" />
              <span>Cargar prueba (Juan Pérez - $23.000)</span>
            </button>
          </div>
        </div>

        {/* STEPPER VISUAL (PASOS 1 a 9) */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 mb-8 border border-slate-200/90 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] text-xs font-bold">
            {/* Paso 1 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-white flex items-center justify-center text-[11px]">
                1
              </span>
              <span className="text-slate-800">Datos Cliente</span>
            </div>
            <span className="text-slate-300">→</span>

            {/* Pasos 2-6 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-white flex items-center justify-center text-[11px]">
                2-6
              </span>
              <span className="text-slate-800">Prendas & Arreglos</span>
            </div>
            <span className="text-slate-300">→</span>

            {/* Paso 7 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-950 text-white flex items-center justify-center text-[11px]">
                7
              </span>
              <span className="text-slate-800">Calculadora</span>
            </div>
            <span className="text-slate-300">→</span>

            {/* Paso 8 */}
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  wizardMode === 'review' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                8
              </span>
              <span className={wizardMode === 'review' ? 'text-sky-900 font-extrabold' : 'text-slate-600'}>
                Revisar Pedido
              </span>
            </div>
            <span className="text-slate-300">→</span>

            {/* Paso 9 */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                9
              </span>
              <span className="text-emerald-800 font-extrabold">Enviar por WhatsApp</span>
            </div>
          </div>
        </div>

        {/* PANTALLA 1: FORMULARIO DE EDICIÓN Y PRENDAS (PASOS 1 a 7) */}
        {wizardMode === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Tarjetas de Contacto y Prendas */}
            <div className="lg:col-span-7 space-y-6">
              {/* TARJETAS: DATOS PERSONALES y DATOS DE RECOGIDA */}
              <CustomerContactForm
                customer={customer}
                onChange={(upd) => setCustomer((prev) => ({ ...prev, ...upd }))}
                errors={fieldErrors}
                touched={touched}
                onBlurField={handleBlurField}
                deliveryZones={deliveryZones}
                pickupDate={pickupDate}
                onPickupDateChange={setPickupDate}
                pickupTimeSlot={pickupTimeSlot}
                onPickupTimeSlotChange={setPickupTimeSlot}
              />

              {/* TARJETA: PRENDAS PARA ARREGLO (PASOS 2 a 6) */}
              <GarmentsForm
                items={items}
                onChangeItems={setItems}
                availableServices={services}
              />

              {/* Observaciones Generales opcionales */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Observaciones Generales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={generalObservations}
                  onChange={(e) => setGeneralObservations(e.target.value)}
                  placeholder="Instrucciones adicionales para todo el paquete o indicaciones de cuidado especial..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Right Column: CALCULADORA EN TIEMPO REAL (PASO 7) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <OrderCalculatorCard
                order={currentOrder}
                onSelectReview={handleProceedToReview}
                onDirectSendWhatsApp={handleConfirmSendWhatsApp}
                canProceedToReview={validation.valid}
                validationErrors={validation.errors}
              />
            </div>
          </div>
        )}

        {/* PANTALLA 2: PANTALLA "REVISA TU SOLICITUD" (PASO 8) */}
        {wizardMode === 'review' && (
          <OrderReviewView
            order={currentOrder}
            onEdit={handleBackToForm}
            onConfirmSendWhatsApp={handleConfirmSendWhatsApp}
            isSubmitting={isSubmitting}
          />
        )}

        {/* PANTALLA 3 / MODAL: "MENSAJE LISTO PARA WHATSAPP" (PASO 9) */}
        <WhatsAppReadyModal
          order={currentOrder}
          isOpen={isReadyModalOpen}
          onClose={() => setIsReadyModalOpen(false)}
          onFinishAndTrack={handleFinishAndTrack}
        />
      </div>

      {/* BARRA FLOTANTE RESUMIDA EN DISPOSITIVOS MÓVILES (REQUISITO 24) */}
      {wizardMode === 'form' && (
        <div
          id="mobile-sticky-calculator-bar"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Subtotal: <span className="font-bold text-slate-800">{formatCOP(orderSubtotal)}</span>
            </p>
            <p className="text-sm sm:text-base font-black text-sky-950 truncate">
              Total: <span>{formatCOP(orderTotal)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="mobile-btn-send-whatsapp"
              onClick={handleConfirmSendWhatsApp}
              disabled={!validation.valid}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white stroke-emerald-600" />
              <span>ENVIAR SOLICITUD</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToReview}
              disabled={!validation.valid}
              className="p-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
              title="Ver Resumen"
            >
              <span className="text-slate-800">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
