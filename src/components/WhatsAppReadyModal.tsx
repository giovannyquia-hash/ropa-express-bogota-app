import React, { useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { OrderState, whatsappService } from '../services/whatsappService';

export interface WhatsAppReadyModalProps {
  order: OrderState;
  isOpen: boolean;
  onClose: () => void;
  onFinishAndTrack?: () => void;
}

export const WhatsAppReadyModal: React.FC<WhatsAppReadyModalProps> = ({
  order,
  isOpen,
  onClose,
  onFinishAndTrack,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const message = whatsappService.generateWhatsAppMessage(order);
  const whatsappUrl = whatsappService.getWhatsAppUrl(order);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    whatsappService.sendToWhatsApp(order);
    if (onFinishAndTrack) {
      onFinishAndTrack();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-blue-950">
            Mensaje listo para WhatsApp
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifica el contenido real generado directamente desde tu pedido.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Lo calculado = Lo que se envía</span>
          </div>
        </div>

        {/* Message preview area */}
        <div className="my-4 flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡MENSAJE COPIADO!' : 'COPIAR MENSAJE'}</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="w-full sm:w-1/2 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ENVIAR SOLICITUD POR WHATSAPP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
