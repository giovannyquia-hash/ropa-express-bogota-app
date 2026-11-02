/**
 * UTILIDADES DE FORMATEO Y VALIDACIÓN - ROPA EXPRESS BOGOTÁ
 */

/**
 * Formatea un valor numérico a Pesos Colombianos (COP)
 * Formato requerido: $8.000, $15.000, $125.000
 * Sin decimales, con punto de miles y signo pesos.
 */
export function formatCOP(value: number | null | undefined): string {
  const num = Math.round(Number(value) || 0);
  return `$${num.toLocaleString('es-CO')}`;
}

/**
 * Valida si un número corresponde a un teléfono móvil colombiano válido.
 * Acepta:
 * - 10 dígitos iniciando en 3 (ej. 3001234567, 3192787603)
 * - Con indicativo 57 o +57 (ej. +573192787603, 573192787603)
 */
export function isValidColombianPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('3')) {
    return true;
  }
  if (clean.length === 12 && clean.startsWith('573')) {
    return true;
  }
  return false;
}

/**
 * Normaliza un teléfono colombiano para envío por WhatsApp (código de país 57 + 10 dígitos)
 */
export function normalizeColombianPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('3')) {
    return `57${clean}`;
  }
  if (clean.length === 12 && clean.startsWith('573')) {
    return clean;
  }
  return clean;
}

/**
 * Valida formato de correo electrónico
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Genera un identificador único de pedido con el formato:
 * RE-2026-XXXXXX (ej. RE-2026-000125)
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RE-2026-${randomNum}`;
}
