import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Edit3,
  CheckCircle2,
  Copy,
  Check,
  Truck,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Shirt,
  MapPin,
  User,
  Phone,
} from 'lucide-react';
import { OrderState, whatsappService } from '../services/whatsappService';
import { formatCOP } from '../utils/formatters';

export interface OrderReviewViewProps {
  order: OrderState;
  onEdit: () => void;
  onConfirmSendWhatsApp: () => void;
  isSubmitting?: boolean;
}

export const OrderReviewView: React.FC<OrderReviewViewProps> = ({
  order,
  onEdit,
  onConfirmSendWhatsApp,
  isSubmitting = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawMessagePreview, setShowRawMessagePreview] = useState(false);

  const rawMessage = whatsappService.generateWhatsAppMessage(order);
  const hasEstimates = order.hasEstimates || order.items.some((it) => it.isEstimate);

  // Formato del valor de domicilio
  let deliveryDisplay = 'Pendiente de confirmación';
  if (order.deliveryFee === 0 || order.deliveryFee === 'GRATIS') {
    deliveryDisplay = 'GRATIS';
  } else if (typeof order.deliveryFee === 'number' && order.deliveryFee > 0) {
    deliveryDisplay = formatCOP(order.deliveryFee);
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition py-2 px-3 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Editar pedido</span>
        </button>

        <span className="text-xs font-mono font-bold bg-sky-100 text-sky-900 px-3 py-1 rounded-full border border-sky-200">
          Pedido: {order.id}
        </span>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Visual Brand Accent */}
        <div className="text-center pb-6 border-b border-slate-100">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-3 py-1 rounded-full">
            ROPA EXPRESS BOGOTÁ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 mt-2 tracking-tight">
            SOLICITUD DE ARREGLO
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisa tu solicitud antes de enviarla a nuestro taller de sastrería
          </p>
        </div>

        {/* DATOS DEL CLIENTE */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            DATOS DEL CLIENTE
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Cliente:</p>
              <p className="font-extrabold text-blue-950 text-base">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">WhatsApp:</p>
              <p className="font-bold text-slate-800">{order.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Dirección:</p>
              <p className="font-bold text-slate-800">{order.customer.address}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Barrio:</p>
              <p className="font-bold text-slate-800">{order.customer.neighborhood}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">LOCALIDAD:</p>
              <p className="font-bold text-sky-800 uppercase">{order.customer.locality}</p>
            </div>
            {order.customer.pickupNotes && (
              <div>
                <p className="text-xs text-slate-500">Indicaciones de recogida:</p>
                <p className="text-slate-700 italic text-xs">{order.customer.pickupNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* PRENDAS */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            PRENDAS ({order.items.length})
          </h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-950 text-base">
                    {idx + 1}. {item.garmentType}
                  </span>
                  <span className="font-extrabold text-sky-900 text-sm">
                    Subtotal: {formatCOP(item.subtotal)}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  <span className="font-bold">Arreglo:</span> {item.service}
                </p>
                <p className="text-xs text-slate-700">
                  <span className="font-bold">Cantidad:</span> {item.quantity} •{' '}
                  <span className="font-bold">Precio unitario:</span> {formatCOP(item.unitPrice)}{' '}
                  {item.isEstimate && '(Estimado)'}
                </p>

                {item.description && item.description.trim() !== '' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-slate-600">Descripción:</span>
                    <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 mt-1 font-mono text-xs">
                      {item.description}
                    </p>
                  </div>
                )}

                {item.photos && item.photos.length > 0 && (
                  <p className="text-[11px] text-sky-700 font-semibold mt-1">
                    ✓ Fotografías: {item.photos.length} foto(s) adjunta(s) en la solicitud.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TOTALES RESUMEN */}
        <div className="py-6 border-b border-slate-100 space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold uppercase tracking-wider">SUBTOTAL:</span>
            <span className="font-extrabold text-slate-900 text-base">{formatCOP(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold uppercase tracking-wider">DOMICILIO:</span>
            <span className="font-extrabold text-slate-900 text-base">{deliveryDisplay}</span>
          </div>

          {order.additionalCharges && order.additionalCharges > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold uppercase tracking-wider">RECARGOS:</span>
              <span className="font-extrabold text-slate-900 text-base">{formatCOP(order.additionalCharges)}</span>
            </div>
          )}

          {order.discount && order.discount > 0 && (
            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-bold uppercase tracking-wider">DESCUENTO:</span>
              <span className="font-extrabold text-base">-{formatCOP(order.discount)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-sky-50 p-4 rounded-2xl">
            <span className="text-base font-black text-blue-950 uppercase tracking-wider">TOTAL:</span>
            <span className="text-2xl sm:text-3xl font-black text-sky-900">{formatCOP(order.total)}</span>
          </div>
        </div>

        {/* OBSERVACIONES GENERALES */}
        {order.generalObservations && (
          <div className="py-4 border-b border-slate-100 text-xs text-slate-700">
            <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
              OBSERVACIONES GENERALES:
            </span>
            <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
              "{order.generalObservations}"
            </p>
          </div>
        )}

        {/* Estimations notice */}
        {hasEstimates && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Nota:</strong> Valor estimado sujeto a confirmación después de revisar la prenda.
            </span>
          </div>
        )}

        {/* Action Buttons as requested */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onEdit}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>EDITAR PEDIDO</span>
          </button>

          <button
            type="button"
            id="btn-enviar-solicitud-whatsapp"
            onClick={onConfirmSendWhatsApp}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl text-sm sm:text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>ENVIAR SOLICITUD POR WHATSAPP</span>
          </button>
        </div>

        {/* Verification accordeon: "Mensaje listo para WhatsApp" */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowRawMessagePreview(!showRawMessagePreview)}
            className="text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center gap-1.5 transition"
          >
            <span>{showRawMessagePreview ? '▲ Ocultar mensaje listo para WhatsApp' : '▼ Ver mensaje listo para WhatsApp'}</span>
          </button>

          {showRawMessagePreview && (
            <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold">Mensaje listo para WhatsApp:</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-sans font-bold flex items-center gap-1 text-slate-200 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'COPIAR MENSAJE'}</span>
                </button>
              </div>
              {rawMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
