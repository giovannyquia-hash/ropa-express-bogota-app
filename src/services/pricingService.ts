import { OrderItem, ServiceItem } from '../types';
import { formatCOP } from '../utils/formatters';

export { formatCOP };

/**
 * SERVICIO CENTRAL DE PRECIOS - ROPA EXPRESS BOGOTÁ
 * Todos los componentes (ServiceCard, OrderWizard, PriceCalculator, Checkout, Admin, Chatbot)
 * deben consultar este servicio para obtener valores económicos exactos.
 *
 * Asesor Comercial Oficial: Jose Tiberio huertas (Celular - WhatsApp: 3192787603)
 */

export interface PricingOptions {
  urgent?: boolean;
  discountCode?: string;
  additionalCharge?: number;
  customUnit?: string;
}

export interface ItemCalculationResult {
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
  additionalCharge: number;
  discount: number;
  finalPrice: number;
  isEstimate: boolean;
}

export const pricingService = {
  /**
   * Obtiene el precio unitario base o estimado de un servicio.
   */
  getServicePrice(service: ServiceItem): number {
    return Number(service.price) || 0;
  },

  /**
   * Obtiene la unidad oficial de cobro (Kilogramo, Prenda, Arreglo, Servicio, Unidad)
   */
  getServiceUnit(service: ServiceItem): string {
    return service.unit || 'Prenda';
  },

  /**
   * Determina si el servicio requiere inspección previa y se marca como precio estimado
   */
  isEstimatedPrice(service: ServiceItem): boolean {
    return Boolean(service.isEstimate || service.category === 'arreglos');
  },

  /**
   * Calcula el subtotal, recargos y precio final para un ítem del pedido.
   * Reglas de negocio según unidad:
   * - KG: Precio × kilogramos (aplica precio mínimo si aplica)
   * - PRENDA: Precio × cantidad de prendas
   * - UNIDAD: Precio × unidades
   * - SERVICIO: Precio fijo base
   * - ARREGLO: Precio base o estimado
   */
  calculateItem(service: ServiceItem, quantity: number, options?: PricingOptions): ItemCalculationResult {
    const qty = Math.max(1, quantity || 1);
    const unitPrice = this.getServicePrice(service);
    const unit = this.getServiceUnit(service);
    const isEstimate = this.isEstimatedPrice(service);

    let rawSubtotal = unitPrice * qty;

    // Regla de precio mínimo si el servicio lo especifica
    if (service.minimumPrice && service.minimumPrice > 0 && rawSubtotal < service.minimumPrice) {
      rawSubtotal = service.minimumPrice;
    }

    const additionalCharge = options?.additionalCharge || (service.additionalCharge ? service.additionalCharge * qty : 0);
    const discount = options?.discountCode ? this.calculateDiscount(rawSubtotal, options.discountCode) : (service.discount || 0);

    const finalPrice = Math.max(0, rawSubtotal + additionalCharge - discount);

    return {
      unitPrice,
      quantity: qty,
      unit,
      subtotal: rawSubtotal,
      additionalCharge,
      discount,
      finalPrice,
      isEstimate,
    };
  },

  /**
   * Calcula el subtotal de una lista de OrderItem
   */
  calculateSubtotal(items: OrderItem[]): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((acc, it) => acc + (it.subtotal || it.quantity * it.unitPrice || 0), 0);
  },

  /**
   * Calcula recargos adicionales (por urgencia express o arreglos complejos)
   */
  calculateAdditionalCharge(items: OrderItem[], options?: PricingOptions): number {
    let charge = 0;
    if (options?.urgent) {
      charge += 10000; // Recargo de servicio exprés en Bogotá
    }
    const itemCharges = items.reduce((acc, it) => acc + (it.additionalCharge || 0), 0);
    return charge + itemCharges;
  },

  /**
   * Calcula descuentos aplicables
   */
  calculateDiscount(subtotal: number, discountCode?: string): number {
    if (!discountCode) return 0;
    const clean = discountCode.trim().toUpperCase();
    if (clean === 'ROPAEXPRESS10' || clean === 'BIENVENIDO') {
      return Math.round(subtotal * 0.1); // 10% de descuento
    }
    if (clean === 'BOGOTA5' || clean === 'EXPRESS5') {
      return Math.round(subtotal * 0.05); // 5% de descuento
    }
    return 0;
  },

  /**
   * Calcula el gran total del pedido
   */
  calculateOrderTotal(
    items: OrderItem[],
    deliveryFee: number,
    options?: { discountCode?: string; urgent?: boolean; extraCharge?: number }
  ): {
    servicesSubtotal: number;
    deliveryFee: number;
    additionalCharge: number;
    discount: number;
    total: number;
    hasEstimates: boolean;
  } {
    const servicesSubtotal = this.calculateSubtotal(items);
    const additionalCharge = (options?.extraCharge || 0) + this.calculateAdditionalCharge(items, options);
    const discount = this.calculateDiscount(servicesSubtotal, options?.discountCode);
    const total = Math.max(0, servicesSubtotal + deliveryFee + additionalCharge - discount);
    const hasEstimates = items.some((it) => it.isEstimate);

    return {
      servicesSubtotal,
      deliveryFee,
      additionalCharge,
      discount,
      total,
      hasEstimates,
    };
  },

  /**
   * Formateo estándar en Pesos Colombianos (COP)
   */
  formatCOP(amount: number): string {
    return formatCOP(amount);
  },
};
