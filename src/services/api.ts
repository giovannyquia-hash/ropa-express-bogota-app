import { DeliveryZone, Order, OrderStatus, ServiceItem, User, Address, GarmentAnalysisResult } from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = 'Error en la solicitud';
    try {
      const data = await res.json();
      errorMsg = data.error || data.details || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Config
  getConfig: () => fetchJson<{ whatsappNumber: string; appName: string }>('/api/config'),

  // Services
  getServices: () => fetchJson<ServiceItem[]>('/api/services'),
  createService: (service: Partial<ServiceItem>) =>
    fetchJson<ServiceItem>('/api/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  updateService: (id: string, service: Partial<ServiceItem>) =>
    fetchJson<ServiceItem>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    }),
  deleteService: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/services/${id}`, {
      method: 'DELETE',
    }),

  // Delivery Zones
  getZones: () => fetchJson<DeliveryZone[]>('/api/zones'),
  updateZone: (id: string, zone: Partial<DeliveryZone>) =>
    fetchJson<DeliveryZone>(`/api/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    }),

  // Users
  getUsers: () => fetchJson<User[]>('/api/users'),
  loginUser: (payload: { email: string; name?: string; phone?: string }) =>
    fetchJson<{ user: User }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getUserAddresses: (userId: string) => fetchJson<Address[]>(`/api/users/${userId}/addresses`),
  saveAddress: (userId: string, address: Partial<Address>) =>
    fetchJson<Address>(`/api/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(address),
    }),

  // Orders
  getOrders: (params?: { userId?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return fetchJson<Order[]>(`/api/orders?${query.toString()}`);
  },
  getOrderById: (id: string) => fetchJson<Order>(`/api/orders/${encodeURIComponent(id)}`),
  createOrder: (orderData: any) =>
    fetchJson<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  updateOrderStatus: (id: string, data: { status?: OrderStatus; comment?: string; internalNotes?: string; extraCharge?: number }) =>
    fetchJson<Order>(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: (userId?: string) => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJson<any[]>(`/api/notifications${query}`);
  },
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean; notification: any }>(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    }),
  dispatchWhatsAppNotification: (payload: { phone: string; message: string; orderId: string }) =>
    fetchJson<any>('/api/notifications/dispatch-whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Gemini AI
  askAssistant: (prompt: string) =>
    fetchJson<{ text: string; proposal?: any; source?: string }>('/api/gemini/assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
  analyzeGarmentPhoto: (imageBase64: string, description?: string) =>
    fetchJson<{ analysis: GarmentAnalysisResult; source?: string }>('/api/gemini/analyze-garment', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, description }),
    }),
};
