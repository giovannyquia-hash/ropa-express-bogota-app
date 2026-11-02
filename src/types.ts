export type OrderStatus =
  | 'SOLICITADO'
  | 'CONFIRMADO'
  | 'RECOGIDA PROGRAMADA'
  | 'RECOGIDO'
  | 'RECIBIDO'
  | 'EN PROCESO'
  | 'EN_PROCESO'
  | 'PLANCHADO'
  | 'EN ARREGLO'
  | 'CONTROL DE CALIDAD'
  | 'LISTO'
  | 'LISTO PARA ENTREGA'
  | 'EN CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type UserRole = 'customer' | 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promo';
  read: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string; // e.g. "Casa", "Trabajo", "Otra"
  address: string;
  neighborhood: string;
  locality: string;
  city: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export type ServiceCategory =
  | 'lavado'
  | 'planchado'
  | 'combo'
  | 'arreglos'
  | 'reparaciones'
  | 'prendas_especiales'
  | 'ropa_hogar'
  | 'especial'
  | 'domicilio'
  | string;

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  garmentType?: string;
  unit: string; // "Kilogramo", "Prenda", "Arreglo", "Servicio", "Unidad"
  price: number;
  minimumPrice?: number;
  estimatedTime?: string;
  active: boolean;
  displayOrder?: number;
  isEstimate?: boolean;
  additionalCharge?: number;
  discount?: number;
  icon?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  serviceId: string;
  serviceName: string;
  description?: string;
  garmentType?: string;
  alterationType?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  subtotal: number;
  additionalCharge?: number;
  discount?: number;
  finalPrice?: number;
  photos?: string[];
  isEstimate?: boolean;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
}

export interface Order {
  id: string; // e.g. "RE-2026-000101"
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: OrderStatus;
  pickupDate: string;
  pickupTime: string;
  deliveryDate?: string;
  deliveryTime?: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  extraCharge?: number;
  total: number;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  history: OrderStatusHistoryEntry[];
}

export interface DeliveryZone {
  id: string;
  locality: string;
  neighborhoods: string[];
  deliveryFee: number;
  estimatedHours: string;
  covered: boolean;
}

export interface GarmentAnalysisResult {
  garmentType: string;
  alterationSuggested: string;
  observations: string;
  estimatedPriceRange: string;
  confidenceNotes: string;
}

export interface CartItem {
  id: string;
  serviceId?: string;
  garmentType: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unit?: string;
  description?: string;
  isEstimate?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  proposal?: {
    services: string[];
    suggestedItems: Array<{
      serviceName: string;
      quantity: number;
      unitPrice: number;
      garmentType?: string;
    }>;
    estimatedTotal: number;
  };
  analysis?: GarmentAnalysisResult;
}
