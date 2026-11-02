import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Upload,
  MessageCircle,
  Shirt,
  Scissors,
  CheckCircle2,
  DollarSign,
  Search,
  ArrowRight,
  Bot,
  PhoneCall,
} from 'lucide-react';
import { ADVISOR_NAME, ADVISOR_PHONE, WHATSAPP_NUMBER } from '../config/constants';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  proposal?: any;
  photo?: string;
  timestamp: string;
}

export const ChatAssistant: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    startOrderWithService,
    viewTrackingOrder,
    setActiveView,
    addToast,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: 'Hola. Puedo ayudarte a elegir el servicio adecuado para tu ropa, calcular costos en Bogotá o diagnosticar arreglos con fotografías.',
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [chatPhoto, setChatPhoto] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const quickPrompts = [
    { label: 'Quiero lavar ropa', prompt: 'Quiero lavar ropa de diario por kilogramos' },
    { label: 'Quiero planchar', prompt: 'Tengo varias camisas y pantalones para planchar' },
    { label: 'Necesito un arreglo', prompt: 'Necesito un arreglo de sastre para un pantalón que me queda largo' },
    { label: 'Consultar precios', prompt: '¿Cuáles son las tarifas de lavado, planchado y sastrería en Bogotá?' },
    { label: 'Consultar mi pedido', prompt: '¿Cómo puedo rastrear el estado de mi pedido?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query && !chatPhoto) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      photo: chatPhoto || undefined,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    const photoToAnalyze = chatPhoto;
    setChatPhoto(null);
    setLoading(true);

    try {
      if (photoToAnalyze) {
        // Run photo analysis
        const res = await api.analyzeGarmentPhoto(photoToAnalyze, query);
        const analysis = res.analysis;
        const replyText = `Hemos analizado la fotografía de tu prenda:
• Prenda: ${analysis.garmentType}
• Servicio sugerido: ${analysis.alterationSuggested}
• Diagnóstico preliminar: ${analysis.observations}
• Rango de precio estimado: ${analysis.estimatedPriceRange}

${analysis.confidenceNotes}`;

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-bot-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            proposal: {
              services: [analysis.alterationSuggested],
              suggestedItems: [
                {
                  serviceName: analysis.alterationSuggested,
                  garmentType: analysis.garmentType,
                  quantity: 1,
                  unitPrice: 8000,
                },
              ],
            },
            timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Run assistant prompt
        const res = await api.askAssistant(query);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-bot-${Date.now()}`,
            sender: 'bot',
            text: res.text,
            proposal: res.proposal,
            timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: 'Con gusto te asesoramos. En Ropa Express Bogotá recogemos a domicilio tus prendas para lavado, planchado fino o sastrería.',
          timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setChatPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isChatOpen) {
    return (
      <button
        id="btn-floating-chat-trigger"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-gradient-to-br from-blue-950 to-sky-800 hover:from-blue-900 hover:to-sky-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 group ring-4 ring-sky-400/20"
        title="Abrir Asistente con Inteligencia Artificial"
      >
        <Sparkles className="w-6 h-6 text-sky-300 animate-pulse" />
        <span className="hidden sm:inline font-bold text-xs pr-1">Asistente IA</span>
      </button>
    );
  }

  return (
    <div
      id="chat-assistant-window"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[560px] overflow-hidden animate-in slide-in-from-bottom-5"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">Asistente Ropa Express</h3>
            <p className="text-[11px] text-sky-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Con tecnología Gemini AI</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsChatOpen(false)}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          aria-label="Cerrar chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Advisor Quick Contact Banner */}
      <div className="bg-sky-50 border-b border-sky-100 px-3.5 py-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-sky-950 font-medium">
          <PhoneCall className="w-3.5 h-3.5 text-sky-700 flex-shrink-0" />
          <span className="truncate">
            Asesor: <strong>{ADVISOR_NAME}</strong>
          </span>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            'Hola Jose Tiberio, requiero asesoría sobre tarifas oficiales y recogida de Ropa Express Bogotá.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition flex-shrink-0"
        >
          <MessageCircle className="w-3 h-3" />
          <span>WhatsApp</span>
        </a>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-950 text-white rounded-br-xs'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
              }`}
            >
              {m.photo && (
                <img
                  src={m.photo}
                  alt="Foto adjunta"
                  className="w-full h-32 object-cover rounded-xl border border-white/20 mb-2"
                />
              )}

              <p className="whitespace-pre-line">{m.text}</p>

              {/* Proposal Box if AI detected an order idea */}
              {m.proposal && (
                <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-sky-700" />
                    <span>Propuesta de servicio detectada:</span>
                  </div>

                  {m.proposal.suggestedItems && (
                    <ul className="text-[11px] space-y-1">
                      {m.proposal.suggestedItems.map((it: any, idx: number) => (
                        <li key={idx} className="font-medium">
                          • {it.quantity || 1}x {it.serviceName || it.garmentType}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      startOrderWithService();
                    }}
                    className="w-full mt-2 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-[11px] transition flex items-center justify-center gap-1.5"
                  >
                    <span>Llevar propuesta a mi pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-500 w-fit">
            <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
            <span>Consultando asistente de Ropa Express...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900 text-[11px] font-semibold transition"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Pending Photo Preview */}
      {chatPhoto && (
        <div className="px-3 py-2 bg-sky-50 border-t border-sky-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <img src={chatPhoto} alt="Previa" className="w-8 h-8 rounded-md object-cover border" />
            <span className="text-sky-900 font-semibold">Foto adjunta lista para análisis</span>
          </div>
          <button onClick={() => setChatPhoto(null)} className="text-slate-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <label className="p-2 rounded-xl text-slate-500 hover:text-sky-700 hover:bg-slate-100 cursor-pointer transition">
          <Upload className="w-4 h-4" />
          <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
        </label>

        <input
          type="text"
          placeholder="Describe tus prendas, daños o dudas..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <button
          type="submit"
          disabled={loading || (!inputVal.trim() && !chatPhoto)}
          className="p-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white transition disabled:opacity-30"
          aria-label="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
