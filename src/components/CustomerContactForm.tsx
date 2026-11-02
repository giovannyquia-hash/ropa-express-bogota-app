import React from 'react';
import { User, Phone, Mail, MapPin, Building, Home, Clock, Calendar, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { CustomerInfo } from '../services/whatsappService';
import { isValidColombianPhone, isValidEmail } from '../utils/formatters';
import { DeliveryZone } from '../types';

export interface CustomerContactFormProps {
  customer: CustomerInfo;
  onChange: (updated: Partial<CustomerInfo>) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  onBlurField?: (field: string) => void;
  deliveryZones: DeliveryZone[];
  pickupDate?: string;
  onPickupDateChange?: (date: string) => void;
  pickupTimeSlot?: string;
  onPickupTimeSlotChange?: (slot: string) => void;
  timeSlots?: string[];
  showSchedule?: boolean;
}

export const CustomerContactForm: React.FC<CustomerContactFormProps> = ({
  customer,
  onChange,
  errors = {},
  touched = {},
  onBlurField,
  deliveryZones,
  pickupDate,
  onPickupDateChange,
  pickupTimeSlot,
  onPickupTimeSlotChange,
  timeSlots = [
    '8:00 a.m. - 10:00 a.m.',
    '10:00 a.m. - 12:00 p.m.',
    '12:00 p.m. - 2:00 p.m.',
    '2:00 p.m. - 4:00 p.m.',
    '4:00 p.m. - 6:00 p.m.',
  ],
  showSchedule = true,
}) => {
  // Determine card status indicators
  const isPersonalComplete =
    customer.name.trim().length >= 3 &&
    isValidColombianPhone(customer.phone) &&
    (!customer.email || isValidEmail(customer.email));

  const isPersonalStarted =
    customer.name.trim().length > 0 || customer.phone.trim().length > 0 || (customer.email?.trim().length ?? 0) > 0;

  const isPickupComplete =
    customer.address.trim().length >= 5 &&
    customer.neighborhood.trim().length >= 2 &&
    customer.locality.trim().length > 0;

  const isPickupStarted =
    customer.address.trim().length > 0 ||
    customer.neighborhood.trim().length > 0 ||
    customer.locality.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* TARJETA 1: DATOS PERSONALES */}
      <div
        id="card-datos-personales"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs transition hover:shadow-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-blue-950 uppercase tracking-tight">
                DATOS PERSONALES
              </h3>
              <p className="text-xs text-slate-500">Información para tu cuenta y confirmación del servicio</p>
            </div>
          </div>

          {/* Indicator Badge */}
          {isPersonalComplete ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Completo</span>
            </span>
          ) : isPersonalStarted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>● En proceso</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              <span>○ Pendiente</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Nombre completo */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre completo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-customer-name"
                type="text"
                value={customer.name}
                onChange={(e) => onChange({ name: e.target.value })}
                onBlur={() => onBlurField?.('name')}
                placeholder="Ej. Juan Pérez"
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.name && touched.name
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.name && touched.name ? (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.name}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">Mínimo 3 caracteres para registrar tu solicitud.</p>
            )}
          </div>

          {/* Número de WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Número de WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-customer-phone"
                type="tel"
                value={customer.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                onBlur={() => onBlurField?.('phone')}
                placeholder="Ej. 3001234567"
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.phone && touched.phone
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.phone && touched.phone ? (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.phone}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Número colombiano a 10 dígitos donde te enviaremos la confirmación.
              </p>
            )}
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo electrónico <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-customer-email"
                type="email"
                value={customer.email || ''}
                onChange={(e) => onChange({ email: e.target.value })}
                onBlur={() => onBlurField?.('email')}
                placeholder="Ej. juan.perez@correo.com"
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.email && touched.email
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.email && touched.email ? (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.email}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">Para el envío de factura y recibo detallado.</p>
            )}
          </div>
        </div>
      </div>

      {/* TARJETA 2: DATOS DE RECOGIDA */}
      <div
        id="card-datos-recogida"
        className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs transition hover:shadow-md"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-blue-950 uppercase tracking-tight">
                DATOS DE RECOGIDA
              </h3>
              <p className="text-xs text-slate-500">Ubicación exacta para el servicio puerta a puerta en Bogotá</p>
            </div>
          </div>

          {/* Indicator Badge */}
          {isPickupComplete ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ Completo</span>
            </span>
          ) : isPickupStarted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>● En proceso</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              <span>○ Pendiente</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dirección de recogida <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-customer-address"
                type="text"
                value={customer.address}
                onChange={(e) => onChange({ address: e.target.value })}
                onBlur={() => onBlurField?.('address')}
                placeholder="Ej. Calle 10 # 20-30 Apto 402"
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.address && touched.address
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              <Home className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.address && touched.address ? (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.address}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">Obligatoria para la llegada de nuestro mensajero.</p>
            )}
          </div>

          {/* Barrio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Barrio <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-customer-neighborhood"
                type="text"
                value={customer.neighborhood}
                onChange={(e) => onChange({ neighborhood: e.target.value })}
                onBlur={() => onBlurField?.('neighborhood')}
                placeholder="Ej. Centro, Chapinero Alto, Cedritos"
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.neighborhood && touched.neighborhood
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              />
              <Building className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.neighborhood && touched.neighborhood ? (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.neighborhood}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">Nombre del barrio o sector.</p>
            )}
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Localidad en Bogotá <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-customer-locality"
                value={customer.locality}
                onChange={(e) => onChange({ locality: e.target.value })}
                onBlur={() => onBlurField?.('locality')}
                className={`w-full bg-slate-50/70 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.locality && touched.locality
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-200 focus:ring-sky-500'
                }`}
              >
                <option value="">Selecciona tu localidad...</option>
                {deliveryZones.map((z) => (
                  <option key={z.id} value={z.locality}>
                    {z.locality} (Domicilio: ${z.deliveryFee.toLocaleString('es-CO')} COP)
                  </option>
                ))}
                <option value="Los Mártires">Los Mártires</option>
                <option value="Candelaria">Candelaria</option>
                <option value="San Cristóbal">San Cristóbal</option>
                <option value="Puente Aranda">Puente Aranda</option>
                <option value="Bosa">Bosa</option>
                <option value="Kennedy">Kennedy</option>
                <option value="Tunjuelito">Tunjuelito</option>
                <option value="Rafael Uribe Uribe">Rafael Uribe Uribe</option>
                <option value="Ciudad Bolívar">Ciudad Bolívar</option>
                <option value="Usme">Usme</option>
                <option value="Otra localidad">Otra localidad de Bogotá</option>
              </select>
            </div>
            {errors.locality && touched.locality && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.locality}</span>
              </p>
            )}
          </div>

          {/* Indicaciones para la recogida */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Indicaciones para la recogida (Opcional)
            </label>
            <textarea
              id="textarea-customer-pickup-notes"
              rows={2}
              value={customer.pickupNotes || ''}
              onChange={(e) => onChange({ pickupNotes: e.target.value })}
              placeholder="Ej. Dejar en portería con celador, timbre 402, edificio sin ascensor..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>

          {/* Programación de Recogida */}
          {showSchedule && onPickupDateChange && onPickupTimeSlotChange && (
            <div className="md:col-span-2 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fecha de recogida sugerida
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={pickupDate || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => onPickupDateChange(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Franja horaria preferida
                </label>
                <div className="relative">
                  <select
                    value={pickupTimeSlot}
                    onChange={(e) => onPickupTimeSlotChange(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
