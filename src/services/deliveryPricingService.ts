import { DeliveryZone, OrderItem } from '../types';
import { pricingService } from './pricingService';

/**
 * SERVICIO CENTRAL DE TARIFAS DE DOMICILIO - ROPA EXPRESS BOGOTÁ
 * Gestiona y calcula de forma automática los costos de recogida y entrega
 * puerta a puerta por localidad y zona geográfica en Bogotá D.C.
 *
 * Asesor Comercial Oficial: Jose Tiberio huertas (Celular - WhatsApp: 3192787603)
 */

export interface DeliveryBreakdown {
  servicesSubtotal: number;
  deliveryFee: number;
  additionalCharges: number;
  discount: number;
  total: number;
  locality: string;
  isCovered: boolean;
  estimatedHours: string;
  formattedServices: string;
  formattedDelivery: string;
  formattedTotal: string;
}

export const deliveryPricingService = {
  /**
   * Obtiene la zona de entrega correspondiente a la localidad ingresada.
   */
  findZone(localityName: string, zones: DeliveryZone[]): DeliveryZone | undefined {
    if (!localityName || !zones || zones.length === 0) return undefined;
    const clean = localityName.trim().toLowerCase();
    return zones.find(
      (z) =>
        z.locality.toLowerCase() === clean ||
        z.locality.toLowerCase().includes(clean) ||
        clean.includes(z.locality.toLowerCase()) ||
        z.neighborhoods.some((n) => n.toLowerCase().includes(clean) || clean.includes(n.toLowerCase()))
    );
  },

  /**
   * Calcula el costo de domicilio para una localidad determinada.
   * Reglas de negocio:
   * - Tarifa base según zona en Bogotá (Usaquén $5.000, Chapinero $5.000, Suba $6.000, Teusaquillo $6.000, etc.)
   * - Si la zona no tiene cobertura inmediata, se marca para confirmación con asesor (Jose Tiberio huertas: 3192787603)
   */
  calculateDeliveryFee(localityName: string, zones: DeliveryZone[], subtotal: number = 0): number {
    const zone = this.findZone(localityName, zones);
    if (!zone) {
      return 6000; // Tarifa promedio Bogotá D.C.
    }
    if (!zone.covered) {
      return 0; // Zona especial requiere confirmación
    }

    // Promoción: Pedidos mayores a $80.000 COP reciben 50% de descuento en el domicilio
    if (subtotal >= 80000) {
      return Math.round(zone.deliveryFee * 0.5);
    }

    return zone.deliveryFee;
  },

  /**
   * Verifica si la localidad cuenta con cobertura activa garantizada
   */
  isCovered(localityName: string, zones: DeliveryZone[]): boolean {
    const zone = this.findZone(localityName, zones);
    if (!zone) return true; // Asumir cobertura estándar Bogotá
    return zone.covered;
  },

  /**
   * Genera el desglose financiero exacto con la regla estricta:
   * SERVICIOS $X
   * DOMICILIO $Y
   * TOTAL $Z
   */
  getDeliveryBreakdown(
    items: OrderItem[],
    localityName: string,
    zones: DeliveryZone[],
    options?: { discountCode?: string; urgent?: boolean; extraCharge?: number }
  ): DeliveryBreakdown {
    const servicesSubtotal = pricingService.calculateSubtotal(items);
    const zone = this.findZone(localityName, zones);
    const deliveryFee = this.calculateDeliveryFee(localityName, zones, servicesSubtotal);
    const isCovered = zone ? zone.covered : true;
    const estimatedHours = zone?.estimatedHours || '24 a 48 hrs';

    const calc = pricingService.calculateOrderTotal(items, deliveryFee, options);

    return {
      servicesSubtotal: calc.servicesSubtotal,
      deliveryFee: calc.deliveryFee,
      additionalCharges: calc.additionalCharge,
      discount: calc.discount,
      total: calc.total,
      locality: localityName,
      isCovered,
      estimatedHours,
      formattedServices: pricingService.formatCOP(calc.servicesSubtotal),
      formattedDelivery: pricingService.formatCOP(calc.deliveryFee),
      formattedTotal: pricingService.formatCOP(calc.total),
    };
  },
};
