import React from 'react';
import { Calculator, CheckCircle2, Info, Sparkles, AlertCircle, Truck, MessageCircle } from 'lucide-react';
import { OrderState } from '../services/whatsappService';
import { formatCOP } from '../utils/formatters';

export interface OrderCalculatorCardProps {
  order: OrderState;
  onSelectReview: () => void;
  onDirectSendWhatsApp?: () => void;
  canProceedToReview: boolean;
  validationErrors?: string[];
}

export const OrderCalculatorCard: React.FC<OrderCalculatorCardProps> = ({
  order,
  onSelectReview,
  onDirectSendWhatsApp,
  canProceedToReview,
  validationErrors = [],
}) => {
  const isCalculatorComplete = order.items.length > 0 && order.total > 0;
  const hasEstimates = order.hasEstimates || order.items.some((it) => it.isEstimate);

  // Formato del domicilio
  let deliveryDisplay = 'Pendiente de confirmación';
  if (order.deliveryFee === 0 || order.deliveryFee === 'GRATIS') {
    deliveryDisplay = 'GRATIS';
  } else if (typeof order.deliveryFee === 'number' && order.deliveryFee > 0) {
    deliveryDisplay = formatCOP(order.deliveryFee);
  }

  return (
    <div id="card-calculadora" className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-blue-950 uppercase tracking-tight">
              CALCULADORA EN TIEMPO REAL
            </h3>
            <p className="text-xs text-slate-500">Cálculo exacto derivado directamente del estado del pedido</p>
          </div>
        </div>

        {isCalculatorComplete ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Completo</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>● En proceso</span>
          </span>
        )}
      </div>

      {/* Line items mini breakdown */}
      <div className="mt-5 divide-y divide-slate-100">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-2.5 flex items-center justify-between text-xs text-slate-700">
            <div className="min-w-0 pr-2">
              <p className="font-bold text-slate-900 truncate">
                {idx + 1}. {item.garmentType} - {item.service}
              </p>
              <p className="text-[11px] text-slate-500">
                {item.quantity} × {formatCOP(item.unitPrice)}
                {item.isEstimate && ' (Estimado)'}
              </p>
            </div>
            <span className="font-extrabold text-slate-900 flex-shrink-0">{formatCOP(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Totals Table */}
      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-slate-700">
          <span className="font-medium">SUBTOTAL:</span>
          <span className="font-bold text-slate-900">{formatCOP(order.subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="font-medium flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-sky-600" />
            <span>DOMICILIO:</span>
            {order.customer.locality && (
              <span className="text-xs text-slate-500 font-normal">({order.customer.locality})</span>
            )}
          </span>
          <span
            className={`font-bold ${
              deliveryDisplay === 'GRATIS'
                ? 'text-emerald-700'
                : deliveryDisplay === 'Pendiente de confirmación'
                ? 'text-amber-700'
                : 'text-slate-900'
            }`}
          >
            {deliveryDisplay}
          </span>
        </div>

        {order.additionalCharges && order.additionalCharges > 0 && (
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-medium">RECARGOS ADICIONALES:</span>
            <span className="font-bold text-slate-900">{formatCOP(order.additionalCharges)}</span>
          </div>
        )}

        {order.discount && order.discount > 0 && (
          <div className="flex items-center justify-between text-emerald-700">
            <span className="font-medium">DESCUENTO:</span>
            <span className="font-bold">-{formatCOP(order.discount)}</span>
          </div>
        )}

        {/* Grand Total Highlight */}
        <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
          <div>
            <span className="text-base font-extrabold text-blue-950 block">TOTAL:</span>
            <span className="text-[11px] text-slate-500">Subtotal + Domicilio</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-sky-900 tracking-tight">
            {formatCOP(order.total)}
          </span>
        </div>
      </div>

      {/* Estimations notice */}
      {hasEstimates && (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Precio estimado:</strong> Valor estimado sujeto a confirmación después de revisar la prenda físicamente en el taller.
          </span>
        </div>
      )}

      {/* Validation Errors Notice if any */}
      {!canProceedToReview && validationErrors.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Datos pendientes antes de revisar:</span>
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botones de acción: BOTÓN CLARO PARA ENVIAR + Ver Resumen */}
      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          id="btn-calculator-send-whatsapp"
          onClick={onDirectSendWhatsApp || onSelectReview}
          disabled={!canProceedToReview}
          className="w-full py-4 px-4 rounded-2xl text-sm sm:text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 group"
        >
          <MessageCircle className="w-5 h-5 fill-white stroke-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="uppercase tracking-tight text-white font-extrabold text-xs sm:text-sm">
            ENVIAR TODA ESTA SOLICITUD POR WHATSAPP
          </span>
        </button>

        <button
          type="button"
          id="button-proceed-to-review"
          onClick={onSelectReview}
          disabled={!canProceedToReview}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-950 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 transition flex items-center justify-center gap-2"
        >
          <span>Ver resumen detallado (Paso a paso)</span>
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
        </button>
      </div>
    </div>
  );
};
