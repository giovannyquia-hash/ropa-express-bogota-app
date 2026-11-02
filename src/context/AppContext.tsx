import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppNotification, CartItem, DeliveryZone, Order, ServiceItem, User } from '../types';
import { api } from '../services/api';
import { DEMO_USERS, INITIAL_DELIVERY_ZONES, INITIAL_SERVICES, WHATSAPP_NUMBER } from '../config/constants';

export type AppView = 'home' | 'services' | 'how-it-works' | 'pricing' | 'wizard' | 'tracking' | 'dashboard' | 'admin';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  services: ServiceItem[];
  deliveryZones: DeliveryZone[];
  orders: Order[];
  loadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshZones: () => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  trackingId: string;
  setTrackingId: (id: string) => void;
  viewTrackingOrder: (orderId: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  preselectedServiceId: string | null;
  startOrderWithService: (serviceId?: string) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  whatsappNumber: string;
  openWhatsApp: (customMessage?: string) => void;
  shareOrderOnWhatsApp: (order: Order) => void;

  // Carrito de servicios
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'subtotal'> & { id?: string; subtotal?: number }) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('home');
  // Default logged in as Carlos Mendoza for seamless demo experience
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS[1]);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [trackingId, setTrackingId] = useState<string>('RE-2026-000101');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(WHATSAPP_NUMBER);

  // Carrito de servicios global
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ropa_express_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'cart-init-1',
        serviceId: 'srv-7',
        garmentType: 'Pantalón',
        serviceName: 'Dobladillo',
        quantity: 1,
        unitPrice: 8000,
        subtotal: 8000,
        unit: 'Arreglo',
        description: 'Necesito reducir 5 cm.',
        isEstimate: true,
      },
      {
        id: 'cart-init-2',
        serviceId: 'srv-7',
        garmentType: 'Camisa',
        serviceName: 'Ajuste de manga',
        quantity: 1,
        unitPrice: 10000,
        subtotal: 10000,
        unit: 'Arreglo',
        description: 'Ajustar ambas mangas.',
        isEstimate: true,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('ropa_express_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);

  const addToCart = (item: Omit<CartItem, 'id' | 'subtotal'> & { id?: string; subtotal?: number }) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.unitPrice) || 0;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          (item.serviceId && it.serviceId === item.serviceId) ||
          (it.garmentType.trim().toLowerCase() === item.garmentType.trim().toLowerCase() &&
           it.serviceName.trim().toLowerCase() === item.serviceName.trim().toLowerCase())
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        const updatedQty = copy[existingIdx].quantity + qty;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: updatedQty,
          subtotal: updatedQty * copy[existingIdx].unitPrice,
          description: item.description || copy[existingIdx].description,
        };
        return copy;
      }

      const newItem: CartItem = {
        id: item.id || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        serviceId: item.serviceId,
        garmentType: item.garmentType || 'Prenda',
        serviceName: item.serviceName || 'Servicio',
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price,
        unit: item.unit || 'Prenda',
        description: item.description || '',
        isEstimate: item.isEstimate ?? true,
      };
      return [...prev, newItem];
    });

    addToast({
      type: 'success',
      title: '¡Servicio añadido al carrito!',
      message: `${qty}x ${item.garmentType ? item.garmentType + ' - ' : ''}${item.serviceName}`,
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
    addToast({
      type: 'info',
      title: 'Servicio eliminado',
      message: 'Se quitó el ítem del carrito.',
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = it.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...it,
              quantity: newQty,
              subtotal: newQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCartItems([]);
    addToast({
      type: 'info',
      title: 'Carrito vaciado',
      message: 'Todos los servicios fueron eliminados.',
    });
  };

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch {
      // fallback to initial
    }
  };

  const refreshZones = async () => {
    try {
      const data = await api.getZones();
      setDeliveryZones(data);
    } catch {
      // fallback
    }
  };

  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch {
      // fallback
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // fallback
    }
  };

  const refreshOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
      if (currentUser) {
        refreshNotifications();
      }
    } catch (err: any) {
      console.warn('Could not fetch orders from backend, using fallback:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    api.getConfig()
      .then((cfg) => {
        if (cfg.whatsappNumber) setWhatsappNumber(cfg.whatsappNumber);
      })
      .catch(() => {});

    refreshServices();
    refreshZones();
    refreshOrders();
    if (currentUser) {
      refreshNotifications();
    }
  }, [currentUser?.id]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const viewTrackingOrder = (orderId: string) => {
    setTrackingId(orderId);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOrderWithService = (serviceId?: string) => {
    if (serviceId) {
      setPreselectedServiceId(serviceId);
    }
    setActiveView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = (customMessage?: string) => {
    const msg = encodeURIComponent(customMessage || 'Hola, quiero solicitar un servicio de Ropa Express.');
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const shareOrderOnWhatsApp = (order: Order) => {
    const itemsSummary = order.items
      .map((it) => `• ${it.quantity}x ${it.serviceName} (${it.description || it.garmentType || 'Prenda'})`)
      .join('\n');

    const msg = `*ROPA EXPRESS BOGOTÁ - RESUMEN DE PEDIDO*
*Código:* ${order.id}
*Cliente:* ${order.customerName}
*Estado:* ${order.status}
*Recogida:* ${order.pickupDate} (${order.pickupTime})
*Dirección:* ${order.address.address}, ${order.address.locality}

*Servicios:*
${itemsSummary}

*Subtotal:* $${order.subtotal.toLocaleString('es-CO')} COP
*Domicilio:* $${order.deliveryFee.toLocaleString('es-CO')} COP
*TOTAL:* $${order.total.toLocaleString('es-CO')} COP

_¡Gracias por confiar en Ropa Express Bogotá!_`;

    openWhatsApp(msg);
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        services,
        deliveryZones,
        orders,
        loadingOrders,
        refreshOrders,
        refreshServices,
        refreshZones,
        notifications,
        unreadNotificationsCount,
        refreshNotifications,
        markNotificationAsRead,
        trackingId,
        setTrackingId,
        viewTrackingOrder,
        isChatOpen,
        setIsChatOpen,
        authModalOpen,
        setAuthModalOpen,
        preselectedServiceId,
        startOrderWithService,
        toasts,
        addToast,
        removeToast,
        whatsappNumber,
        openWhatsApp,
        shareOrderOnWhatsApp,
        cartItems,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
