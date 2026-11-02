import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, ServiceItem } from '../types';
import { ORDER_STATUS_SEQUENCE, ORDER_STATUS_LABELS } from '../config/constants';
import { api } from '../services/api';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  Search,
  Filter,
  Eye,
  Edit2,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  Layers,
  MapPin,
  X
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    orders,
    services,
    deliveryZones,
    refreshOrders,
    refreshServices,
    refreshZones,
    addToast,
    viewTrackingOrder,
    currentUser,
    setCurrentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'servicios' | 'zonas'>('pedidos');

  // Order filters
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterLocality, setFilterLocality] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected order for status change modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('EN PROCESO');
  const [statusComment, setStatusComment] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [extraCharge, setExtraCharge] = useState<string>('0');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Service Edit / Create Modal
  const [serviceModalOpen, setServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Metrics calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const pendingOrders = orders.filter((o) => o.status === 'SOLICITADO' || o.status === 'CONFIRMADO');
  const inProgressOrders = orders.filter(
    (o) => o.status === 'RECOGIDO' || o.status === 'EN PROCESO' || o.status === 'RECIBIDO' || o.status === 'CONTROL DE CALIDAD'
  );
  const readyToDeliver = orders.filter((o) => o.status === 'LISTO' || o.status === 'EN CAMINO');
  const dailyIncome = orders
    .filter((o) => o.status !== 'CANCELADO')
    .reduce((acc, o) => acc + o.total, 0);

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'TODOS' && o.status !== filterStatus) return false;
    if (filterLocality !== 'TODOS' && o.address.locality !== filterLocality) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.address.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Open order modal
  const handleOpenOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusComment('');
    setInternalNotes(ord.internalNotes || '');
    setExtraCharge(String(ord.extraCharge || 0));
  };

  // Action: Save order status update
  const handleSaveOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        comment: statusComment || `Estado actualizado a ${ORDER_STATUS_LABELS[newStatus]}`,
        internalNotes,
        extraCharge: Number(extraCharge) || 0,
      });

      await refreshOrders();
      setSelectedOrder(null);
      addToast({
        title: 'Pedido actualizado',
        message: `Orden ${selectedOrder.id} actualizada con éxito.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Error al actualizar',
        message: err.message,
        type: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Service CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || editingService?.price === undefined) return;

    try {
      if (editingService.id) {
        await api.updateService(editingService.id, editingService);
        addToast({ title: 'Servicio modificado', type: 'success' });
      } else {
        await api.createService(editingService);
        addToast({ title: 'Servicio creado', type: 'success' });
      }
      await refreshServices();
      setServiceModalOpen(false);
      setEditingService(null);
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await api.deleteService(id);
      await refreshServices();
      addToast({ title: 'Servicio eliminado', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleToggleServiceActive = async (s: ServiceItem) => {
    try {
      await api.updateService(s.id, { active: !s.active });
      await refreshServices();
      addToast({
        title: s.active ? 'Servicio desactivado' : 'Servicio activado',
        type: 'info',
      });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Top Banner & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-blue-950">Panel de Administración</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              Bogotá Ops
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de pedidos, operarios, talleres aliados, catálogo de servicios y zonas de cobertura.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'pedidos' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('servicios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'servicios' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Servicios ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('zonas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'zonas' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zonas ({deliveryZones.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pedidos Hoy</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-blue-950">{ordersToday.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pendientes</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{pendingOrders.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">En Proceso</span>
            <RefreshCw className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-sky-700">{inProgressOrders.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Para Entregar</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-700">{readyToDeliver.length}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Ingresos Total</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-700">${dailyIncome.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* TAB 1: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por código, cliente o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Estado:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-700"
                >
                  <option value="TODOS">Todos los estados</option>
                  {ORDER_STATUS_SEQUENCE.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_LABELS[st]}
                    </option>
                  ))}
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold">Localidad:</span>
                <select
                  value={filterLocality}
                  onChange={(e) => setFilterLocality(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-700"
                >
                  <option value="TODOS">Todas las localidades</option>
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.locality}>
                      {z.locality}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => refreshOrders()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Refrescar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                <tr>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Prendas</th>
                  <th className="py-3 px-3">Recogida</th>
                  <th className="py-3 px-3">Localidad</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-950">{ord.id}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-900">{ord.items.length} prendas</span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {ord.items.map((i) => i.serviceName).join(', ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{ord.pickupDate}</p>
                      <p className="text-[10px] text-slate-500">{ord.pickupTime}</p>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">{ord.address.locality}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900">
                        {ORDER_STATUS_LABELS[ord.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-blue-950">
                      ${ord.total.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewTrackingOrder(ord.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-100 transition"
                          title="Ver en seguimiento"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenOrderModal(ord)}
                          className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs transition"
                        >
                          Gestionar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICIOS */}
      {activeTab === 'servicios' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-blue-950">Catálogo de Servicios y Tarifas</h2>
            <button
              onClick={() => {
                setEditingService({
                  name: '',
                  description: '',
                  category: 'lavado',
                  unit: 'Prenda',
                  price: 5000,
                  minimumPrice: undefined,
                  estimatedTime: '24 a 48 hrs',
                  isEstimate: false,
                  active: true,
                });
                setServiceModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Servicio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {srv.category}
                      </span>
                      {srv.isEstimate && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Estimado
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleServiceActive(srv)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {srv.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-blue-950">{srv.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600 flex-wrap">
                    {srv.estimatedTime && <span>⏱ {srv.estimatedTime}</span>}
                    {srv.minimumPrice && <span>• Min: ${srv.minimumPrice.toLocaleString('es-CO')}</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-sky-800 text-sm">
                    ${srv.price.toLocaleString('es-CO')} / {srv.unit}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setServiceModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ZONAS */}
      {activeTab === 'zonas' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <h2 className="text-base font-bold text-blue-950 pb-4 border-b border-slate-100">
            Zonas de Domicilio y Cobertura en Bogotá
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryZones.map((z) => (
              <div key={z.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>{z.locality}</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Cubierto
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Barrios:</span> {z.neighborhoods.join(', ')}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{z.estimatedHours}</span>
                  <span className="font-bold text-sky-900">${z.deliveryFee.toLocaleString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDER MANAGEMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 font-mono">{selectedOrder.id}</span>
                <h3 className="text-lg font-bold text-blue-950">Gestionar Pedido</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Cambiar Estado:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-sm text-blue-950"
                >
                  {ORDER_STATUS_SEQUENCE.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_LABELS[st]}
                    </option>
                  ))}
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Comentario para el cliente (Visible en seguimiento):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Prendas recibidas en taller de confección. Todo conforme."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Costo Adicional de Taller (COP):
                </label>
                <input
                  type="number"
                  value={extraCharge}
                  onChange={(e) => setExtraCharge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Se sumará al subtotal (${selectedOrder.subtotal.toLocaleString('es-CO')}) + domicilio ($
                  {selectedOrder.deliveryFee.toLocaleString('es-CO')}).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">
                  Observaciones Internas (Solo Administradores):
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas internas de operarios, asignación de sastre o vehículo de ruta..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"
                />
              </div>

              {/* Notification Dispatch helper */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-950 text-xs">Notificación WhatsApp al Cliente</p>
                  <p className="text-[11px] text-emerald-800">
                    Enviar mensaje directo con el estado actual al {selectedOrder.customerPhone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const msg = `Hola ${selectedOrder.customerName}, te informamos desde Ropa Express Bogotá que tu pedido *${selectedOrder.id}* está en estado: *${ORDER_STATUS_LABELS[newStatus]}*. Comentario: ${statusComment || 'En proceso normal de atención.'}`;
                    try {
                      await api.dispatchWhatsAppNotification({
                        orderId: selectedOrder.id,
                        phone: selectedOrder.customerPhone,
                        message: msg,
                      });
                      const cleanPhone = selectedOrder.customerPhone.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                      addToast({
                        title: 'Notificación enviada',
                        message: `Mensaje preparado para ${selectedOrder.customerName}`,
                        type: 'success',
                      });
                    } catch {
                      addToast({ title: 'Error al enviar', type: 'error' });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Enviar WhatsApp
                </button>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-6 py-2.5 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900"
                >
                  {updatingStatus ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE EDIT/CREATE MODAL */}
      {serviceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-blue-950">
              {editingService.id ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre del Servicio:</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría:</label>
                  <select
                    value={editingService.category || 'lavado'}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <option value="lavado">Lavado</option>
                    <option value="planchado">Planchado</option>
                    <option value="combo">Lavado + Planchado</option>
                    <option value="arreglos">Arreglos / Sastrería</option>
                    <option value="tintoreria">Tintorería / Dry Clean</option>
                    <option value="hogar">Línea Hogar</option>
                    <option value="completo">Servicio Completo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Unidad de Cobro:</label>
                  <input
                    type="text"
                    required
                    placeholder="Prenda, Kilo, Par..."
                    value={editingService.unit || 'Prenda'}
                    onChange={(e) => setEditingService({ ...editingService, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Precio Unitario (COP):</label>
                  <input
                    type="number"
                    required
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sky-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Precio Mínimo (Opcional):</label>
                  <input
                    type="number"
                    placeholder="Ej: 8000"
                    value={editingService.minimumPrice || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        minimumPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tiempo Estimado:</label>
                  <input
                    type="text"
                    placeholder="Ej: 24 a 48 hrs"
                    value={editingService.estimatedTime || '24 a 48 hrs'}
                    onChange={(e) => setEditingService({ ...editingService, estimatedTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tipo de Prenda / Detalle:</label>
                  <input
                    type="text"
                    placeholder="Ej: Camisa, Pantalón..."
                    value={editingService.garmentType || ''}
                    onChange={(e) => setEditingService({ ...editingService, garmentType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEstimateCheck"
                  checked={Boolean(editingService.isEstimate)}
                  onChange={(e) => setEditingService({ ...editingService, isEstimate: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <label htmlFor="isEstimateCheck" className="font-semibold text-slate-800 cursor-pointer">
                  Marcar como "Precio Estimado" (requiere confirmación física en taller o inspección)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Descripción:</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900">
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
