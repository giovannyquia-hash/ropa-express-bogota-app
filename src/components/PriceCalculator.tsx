import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Plus, Minus, ArrowRight, Sparkles, RefreshCw, AlertCircle, Info, ShoppingCart } from 'lucide-react';
import { pricingService } from '../services/pricingService';
import { deliveryPricingService } from '../services/deliveryPricingService';
import { OrderItem } from '../types';

export const PriceCalculator: React.FC = () => {
  const { services, deliveryZones, startOrderWithService, addToCart, setIsCartOpen } = useApp();
  const [selectedLocality, setSelectedLocality] = useState<string>('Chapinero');

  // Interactive items simulator
  const [itemsState, setItemsState] = useState<Record<string, number>>({
    'srv-3': 3, // 3 camisas
    'srv-4': 2, // 2 pantalones
  });

  const updateQty = (id: string, delta: number) => {
    setItemsState((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const resetCalculator = () => {
    setItemsState({});
  };

  // Convert current calculator state to OrderItem array for pricingService
  const calculatedItems: OrderItem[] = Object.entries(itemsState)
    .filter(([_, qty]) => qty > 0)
    .map(([srvId, qty]) => {
      const srv = services.find((s) => s.id === srvId);
      if (!srv) {
        return {
          id: srvId,
          serviceId: srvId,
          serviceName: 'Servicio',
          quantity: qty,
          unitPrice: 0,
          subtotal: 0,
        };
      }
      const calc = pricingService.calculateItem(srv, qty);
      return {
        id: `sim-${srvId}`,
        serviceId: srv.id,
        serviceName: srv.name,
        garmentType: srv.garmentType || srv.name,
        quantity: calc.quantity,
        unit: calc.unit,
        unitPrice: calc.unitPrice,
        subtotal: calc.subtotal,
        additionalCharge: calc.additionalCharge,
        discount: calc.discount,
        finalPrice: calc.finalPrice,
        isEstimate: calc.isEstimate,
      };
    });

  // Calculate delivery & total with deliveryPricingService
  const breakdown = deliveryPricingService.getDeliveryBreakdown(calculatedItems, selectedLocality, deliveryZones);
  const { servicesSubtotal, deliveryFee, total, isCovered, formattedServices, formattedDelivery, formattedTotal } = breakdown;
  const totalItemsCount = Object.values(itemsState).reduce((a, b) => a + b, 0);

  return (
    <section id="precios-section" className="py-16 lg:py-24 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 px-3 py-1 bg-sky-100 rounded-full">
            Tarifas Oficiales Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-3 tracking-tight">
            Calculadora y Cotizador Oficial
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Precios exactos sin sorpresas calculados en tiempo real. Consulta el valor por prenda, kilo o arreglo antes de ordenar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Services selector table / grid */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-blue-950">Catálogo de Servicios y Prendas</h3>
              </div>
              <button
                onClick={resetCalculator}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1 mt-3">
              {services.map((srv) => {
                const qty = itemsState[srv.id] || 0;
                const itemCalc = pricingService.calculateItem(srv, qty > 0 ? qty : 1);

                return (
                  <div key={srv.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 leading-snug">{srv.name}</p>
                        {srv.isEstimate && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Estimado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {pricingService.formatCOP(srv.price)} COP / {srv.unit}
                        </span>
                        {srv.minimumPrice && (
                          <span>• Mín: {pricingService.formatCOP(srv.minimumPrice)}</span>
                        )}
                        {srv.estimatedTime && <span>• {srv.estimatedTime}</span>}
                      </div>
                      {qty > 0 && (
                        <p className="text-[11px] text-sky-700 font-medium mt-1">
                          Subtotal: {qty} × {pricingService.formatCOP(srv.price)} = {pricingService.formatCOP(itemCalc.subtotal)} COP
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <button
                        onClick={() => updateQty(srv.id, -1)}
                        disabled={qty <= 0}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition"
                        aria-label="Disminuir"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-7 text-center font-bold text-sm text-blue-950">{qty}</span>
                      <button
                        onClick={() => updateQty(srv.id, 1)}
                        className="w-8 h-8 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 flex items-center justify-center transition"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Order Summary Card */}
          <div className="lg:col-span-5 sticky top-28 bg-white rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-xl shadow-sky-900/5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-blue-950">Desglose de Cotización</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            {/* Locality Selector for Bogotá */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Localidad de recogida y entrega:
              </label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {deliveryZones.map((z) => (
                  <option key={z.id} value={z.locality}>
                    {z.locality} - Domicilio: ${z.deliveryFee.toLocaleString('es-CO')} COP
                  </option>
                ))}
              </select>
            </div>

            {/* Separate Line-Item Breakdown as explicitly required */}
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 text-sm">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">SERVICIOS:</span>
                <span className="font-bold text-slate-900">{formattedServices}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium">DOMICILIO:</span>
                <span className="font-bold text-slate-900">
                  {servicesSubtotal > 0 ? formattedDelivery : '$0 COP'}
                </span>
              </div>

              {!isCovered && servicesSubtotal > 0 && (
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Zona con confirmación especial de entrega</span>
                </p>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between bg-sky-50/50 p-3 rounded-xl">
                <span className="text-base font-extrabold text-blue-950">TOTAL:</span>
                <span className="text-2xl font-extrabold text-sky-800">
                  {servicesSubtotal > 0 ? formattedTotal : '$0 COP'}
                </span>
              </div>
            </div>

            {/* Formula hint */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>
                Fórmula oficial: Subtotal Servicios + Domicilio = <strong>TOTAL</strong>. Sin cargos ocultos.
              </span>
            </div>

            {/* Botón Carrito y Botón Wizard */}
            <div className="mt-5 space-y-2.5">
              <button
                id="btn-calculator-add-cart"
                onClick={() => {
                  if (calculatedItems.length === 0) return;
                  calculatedItems.forEach((it) => {
                    addToCart({
                      serviceId: it.serviceId,
                      garmentType: it.garmentType || 'Prenda',
                      serviceName: it.serviceName,
                      quantity: it.quantity,
                      unitPrice: it.unitPrice,
                      unit: it.unit,
                      description: `Estimación calculadora: ${it.quantity}x`,
                      isEstimate: it.isEstimate,
                    });
                  });
                  setIsCartOpen(true);
                }}
                disabled={calculatedItems.length === 0}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <ShoppingCart className="w-4 h-4 text-slate-950" />
                <span>Agregar Selección al Carrito ({calculatedItems.length})</span>
              </button>

              <button
                onClick={() => startOrderWithService()}
                className="w-full py-3 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-950 hover:bg-slate-100 active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <span>O continuar al formulario detallado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Garantía de calidad textil y empaque protector incluido</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
