import { WHATSAPP_BUSINESS_NUMBER } from '../config/constants';
import { formatCOP, isValidColombianPhone, isValidEmail } from '../utils/formatters';

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  neighborhood: string;
  barrio?: string;
  locality: string;
  pickupNotes?: string;
}

export interface GarmentItem {
  id?: string;
  garmentType: string;
  service: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  photos?: string[];
  isEstimate?: boolean;
  unit?: string;
}

export interface OrderState {
  id: string; // RE-2026-XXXXXX
  customer: CustomerInfo;
  items: GarmentItem[];
  subtotal: number;
  deliveryFee: number | null | 'GRATIS' | 'PENDING';
  additionalCharges?: number;
  discount?: number;
  total: number;
  requestDate?: string;
  requestTime?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
  generalObservations?: string;
  hasEstimates?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const whatsappService = {
  /**
   * Valida estrictamente que el pedido cuente con todos los campos obligatorios
   * antes de permitir la generación o envío del mensaje a WhatsApp.
   */
  validateOrder(order: OrderState): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      return { valid: false, errors: ['No se ha proporcionado la información del pedido.'] };
    }

    // Validación del cliente
    if (!order.customer?.name || order.customer.name.trim().length < 3) {
      errors.push('El nombre completo es obligatorio y debe tener al menos 3 caracteres.');
    }

    if (!order.customer?.phone || !isValidColombianPhone(order.customer.phone)) {
      errors.push('Ingresa un número de WhatsApp válido (ej. 3001234567 o +57 319 278 7603).');
    }

    if (order.customer?.email && !isValidEmail(order.customer.email)) {
      errors.push('Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).');
    }

    if (!order.customer?.address || order.customer.address.trim().length < 5) {
      errors.push('La dirección de recogida es obligatoria (ej. Calle 10 # 20-30).');
    }

    if (!order.customer?.barrio && !order.customer?.neighborhood) {
      errors.push('El barrio de recogida es obligatorio.');
    }

    if (!order.customer?.locality || order.customer.locality.trim() === '') {
      errors.push('Debes seleccionar la localidad de recogida en Bogotá.');
    }

    // Validación de prendas
    if (!order.items || order.items.length === 0) {
      errors.push('Debes agregar al menos una prenda para el servicio.');
    } else {
      order.items.forEach((item, idx) => {
        const itemNumber = idx + 1;
        if (!item.garmentType || item.garmentType.trim() === '') {
          errors.push(`Prenda ${itemNumber}: Selecciona el tipo de prenda.`);
        }
        if (!item.service || item.service.trim() === '') {
          errors.push(`Prenda ${itemNumber}: Selecciona el tipo de arreglo o servicio.`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Prenda ${itemNumber}: La cantidad debe ser mayor a 0.`);
        }
        if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice < 0) {
          errors.push(`Prenda ${itemNumber}: El precio unitario es inválido.`);
        }
        if (item.subtotal === undefined || item.subtotal === null || item.subtotal < 0) {
          errors.push(`Prenda ${itemNumber}: El subtotal calculado es inválido.`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Genera el texto del mensaje de WhatsApp DIRECTAMENTE desde el objeto order.
   * Mantiene fidelidad absoluta a los valores calculados.
   */
  generateWhatsAppMessage(order: OrderState): string {
    const neighborhood = order.customer.neighborhood || (order.customer as any).barrio || 'No especificado';
    const hasPhotosAny = order.items.some((it) => it.photos && it.photos.length > 0);
    const hasEstimatedItem = order.hasEstimates || order.items.some((it) => it.isEstimate);

    // Formateo del valor de domicilio según especificación
    let deliveryText = 'Pendiente de confirmación';
    if (order.deliveryFee === 0 || order.deliveryFee === 'GRATIS') {
      deliveryText = 'GRATIS';
    } else if (typeof order.deliveryFee === 'number' && order.deliveryFee > 0) {
      deliveryText = formatCOP(order.deliveryFee);
    } else if (order.deliveryFee === 'PENDING' || order.deliveryFee === null) {
      deliveryText = 'Pendiente de confirmación';
    }

    // Prendas formateadas exactamente según el estándar
    const itemsText = order.items
      .map((item, index) => {
        const lines = [
          `${index + 1}. ${item.garmentType}`,
          `   Arreglo: ${item.service}`,
          `   Cantidad: ${item.quantity}`,
          `   Precio unitario: ${formatCOP(item.unitPrice)}${item.isEstimate ? ' (Estimado)' : ''}`,
          `   Subtotal: ${formatCOP(item.subtotal)}`,
        ];

        if (item.description && item.description.trim().length > 0) {
          lines.push('');
          lines.push('Descripción:');
          lines.push(item.description.trim());
        }

        if (item.photos && item.photos.length > 0) {
          lines.push(`Fotografías: ${item.photos.length} foto(s) adjunta(s) en la solicitud.`);
        }

        return lines.join('\n');
      })
      .join('\n\n');

    // Desglose de valores del resumen
    const summaryLines = [`Subtotal: ${formatCOP(order.subtotal)}`, `Domicilio: ${deliveryText}`];

    if (order.additionalCharges && order.additionalCharges > 0) {
      summaryLines.push(`Recargo adicional: ${formatCOP(order.additionalCharges)}`);
    }

    if (order.discount && order.discount > 0) {
      summaryLines.push(`Descuento: -${formatCOP(order.discount)}`);
    }

    summaryLines.push(`Total: ${formatCOP(order.total)}`);

    // Bloque de observaciones
    let obsBlock = '';
    if (order.generalObservations && order.generalObservations.trim().length > 0) {
      obsBlock = `Observaciones generales:\n${order.generalObservations.trim()}\n\n`;
    }

    // Indicaciones de recogida si existen
    let pickupNotesBlock = '';
    if (order.customer.pickupNotes && order.customer.pickupNotes.trim().length > 0) {
      pickupNotesBlock = `Indicaciones de recogida:\n${order.customer.pickupNotes.trim()}\n\n`;
    }

    // Horario y fecha de solicitud / recogida
    const reqDate = order.requestDate || new Date().toLocaleDateString('es-CO');
    const reqTime = order.requestTime || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    let scheduleInfo = `Fecha de solicitud: ${reqDate} (${reqTime})`;
    if (order.pickupDate) {
      scheduleInfo += `\nRecogida programada: ${order.pickupDate} ${order.pickupTimeSlot ? `- ${order.pickupTimeSlot}` : ''}`;
    }

    // Nota de precio estimado si corresponde
    let estimateDisclaimer = '';
    if (hasEstimatedItem) {
      estimateDisclaimer = '\n\n*Nota:* Valor estimado sujeto a confirmación después de revisar la prenda.';
    }

    // Construcción del mensaje respetando el formato requerido
    return `Hola, Ropa Express.

Quiero solicitar un servicio de arreglo de ropa.

Pedido: ${order.id}
${scheduleInfo}

DATOS DEL CLIENTE

Nombre: ${order.customer.name.trim()}
WhatsApp: ${order.customer.phone.trim()}
Dirección: ${order.customer.address.trim()}
Barrio: ${neighborhood.trim()}
Localidad: ${order.customer.locality.trim()}

PRENDAS

${itemsText}

RESUMEN

${summaryLines.join('\n')}

${pickupNotesBlock}${obsBlock}Quedo atento a la confirmación del servicio.${estimateDisclaimer}`;
  },

  /**
   * Construye el enlace universal a WhatsApp utilizando WHATSAPP_BUSINESS_NUMBER
   */
  getWhatsAppUrl(order: OrderState): string {
    const message = this.generateWhatsAppMessage(order);
    const cleanNumber = WHATSAPP_BUSINESS_NUMBER.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Envía la solicitud a WhatsApp abriendo la app en móvil o WhatsApp Web en PC.
   * Valida estrictamente antes de abrir.
   */
  sendToWhatsApp(order: OrderState): { success: boolean; error?: string; url?: string; message?: string } {
    const validation = this.validateOrder(order);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(' '),
      };
    }

    const message = this.generateWhatsAppMessage(order);
    const url = this.getWhatsAppUrl(order);

    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    return {
      success: true,
      url,
      message,
    };
  },
};
