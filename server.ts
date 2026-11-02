import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_SERVICES,
  INITIAL_DELIVERY_ZONES,
  DEMO_USERS,
  DEMO_ORDERS,
  WHATSAPP_NUMBER,
  ADVISOR_NAME,
  ADVISOR_PHONE,
  WHATSAPP_DISPLAY,
} from './src/config/constants.ts';
import { Order, OrderStatus, ServiceItem, DeliveryZone, User } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory data storage seeded with realistic Bogotá data
let services: ServiceItem[] = [...INITIAL_SERVICES];
let deliveryZones: DeliveryZone[] = [...INITIAL_DELIVERY_ZONES];
let users: User[] = [...DEMO_USERS];
let orders: Order[] = [...DEMO_ORDERS];
let userAddresses: Record<string, any[]> = {
  'usr-1': [
    {
      id: 'addr-1',
      userId: 'usr-1',
      name: 'Apartamento Chapinero',
      address: 'Calle 67 # 9-45 Apto 502',
      neighborhood: 'Chapinero Alto',
      locality: 'Chapinero',
      city: 'Bogotá',
      latitude: 4.6521,
      longitude: -74.0583,
      notes: 'Portería con citófono. Dejar en recepción.',
    },
    {
      id: 'addr-1-work',
      userId: 'usr-1',
      name: 'Oficina Financiera',
      address: 'Carrera 7 # 72-10 Piso 11',
      neighborhood: 'El Nogal',
      locality: 'Chapinero',
      city: 'Bogotá',
      notes: 'Horario de recepción 9am a 5pm.',
    },
  ],
  'usr-2': [
    {
      id: 'addr-2',
      userId: 'usr-2',
      name: 'Casa Cedritos',
      address: 'Carrera 15 # 140-22 Torre 2 Apto 301',
      neighborhood: 'Cedritos',
      locality: 'Usaquén',
      city: 'Bogotá',
      latitude: 4.7208,
      longitude: -74.0325,
      notes: 'Timbre 301. Conjunto residencial Sauces.',
    },
  ],
};

let orderCounter = 111;

let notifications: any[] = [
  {
    id: 'notif-101',
    userId: 'usr-1',
    orderId: 'RE-2026-000101',
    title: 'Pedido en proceso de lavado',
    message: 'Tus 8 prendas están en ciclo de lavado suave y planchado en nuestra planta de Chapinero.',
    type: 'order',
    read: false,
    createdAt: '2026-09-20T13:05:00.000Z',
  },
  {
    id: 'notif-102',
    userId: 'usr-2',
    orderId: 'RE-2026-000102',
    title: 'Recogida programada confirmada',
    message: 'Nuestro mensajero pasará por tus prendas de 8:00 a.m. a 10:00 a.m. en Cedritos.',
    type: 'order',
    read: true,
    createdAt: '2026-09-20T12:15:00.000Z',
  },
];

// Lazy initialization of GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Ropa Express Bogotá',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    whatsappNumber: process.env.WHATSAPP_NUMBER || WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP_DISPLAY,
    advisorName: ADVISOR_NAME,
    advisorPhone: ADVISOR_PHONE,
    appName: 'ROPA EXPRESS BOGOTÁ',
    currency: 'COP',
    catalogStatus: 'AUDITED_LOCAL_BASE',
    referenceLink: 'https://share.google/aimode/1EcSmD9D88FsaqLER',
  });
});

// Services CRUD
app.get('/api/services', (req, res) => {
  res.json(services);
});

app.post('/api/services', (req, res) => {
  const {
    name,
    description,
    category,
    garmentType,
    unit,
    price,
    minimumPrice,
    estimatedTime,
    active,
    displayOrder,
    isEstimate,
    additionalCharge,
    discount,
    icon,
  } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios.' });
  }

  const newService: ServiceItem = {
    id: `srv-${Date.now()}`,
    name,
    description: description || '',
    category: category || 'lavado',
    garmentType: garmentType || undefined,
    unit: unit || 'Prenda',
    price: Number(price),
    minimumPrice: minimumPrice !== undefined ? Number(minimumPrice) : undefined,
    estimatedTime: estimatedTime || '24 a 48 hrs',
    active: active !== undefined ? Boolean(active) : true,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : services.length + 1,
    isEstimate: Boolean(isEstimate),
    additionalCharge: additionalCharge ? Number(additionalCharge) : undefined,
    discount: discount ? Number(discount) : undefined,
    icon: icon || 'sparkles',
  };

  services.unshift(newService);
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Servicio no encontrado.' });
  }
  services[index] = {
    ...services[index],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : services[index].price,
    minimumPrice: req.body.minimumPrice !== undefined ? Number(req.body.minimumPrice) : services[index].minimumPrice,
    additionalCharge: req.body.additionalCharge !== undefined ? Number(req.body.additionalCharge) : services[index].additionalCharge,
    discount: req.body.discount !== undefined ? Number(req.body.discount) : services[index].discount,
  };
  res.json(services[index]);
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Servicio no encontrado.' });
  }
  const deleted = services.splice(index, 1);
  res.json({ success: true, deleted: deleted[0] });
});

// Delivery Zones
app.get('/api/zones', (req, res) => {
  res.json(deliveryZones);
});

app.put('/api/zones/:id', (req, res) => {
  const { id } = req.params;
  const index = deliveryZones.findIndex((z) => z.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Zona de entrega no encontrada.' });
  }
  deliveryZones[index] = {
    ...deliveryZones[index],
    ...req.body,
    deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : deliveryZones[index].deliveryFee,
  };
  res.json(deliveryZones[index]);
});

// Users and addresses
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/login', (req, res) => {
  const { email } = req.body;
  const found = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (found) {
    return res.json({ user: found });
  }
  // Create quick demo customer
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: req.body.name || (email ? email.split('@')[0] : 'Cliente Ropa Express'),
    email: email || `cliente${Date.now()}@example.com`,
    phone: req.body.phone || '+57 310 000 0000',
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  res.json({ user: newUser });
});

app.get('/api/users/:userId/addresses', (req, res) => {
  const list = userAddresses[req.params.userId] || [];
  res.json(list);
});

app.post('/api/users/:userId/addresses', (req, res) => {
  const { userId } = req.params;
  const { name, address, neighborhood, locality, city, notes } = req.body;
  if (!address || !locality) {
    return res.status(400).json({ error: 'Dirección y localidad son obligatorias.' });
  }
  const newAddr = {
    id: `addr-${Date.now()}`,
    userId,
    name: name || 'Principal',
    address,
    neighborhood: neighborhood || '',
    locality,
    city: city || 'Bogotá',
    notes: notes || '',
  };
  if (!userAddresses[userId]) {
    userAddresses[userId] = [];
  }
  userAddresses[userId].push(newAddr);
  res.status(201).json(newAddr);
});

// Orders
app.get('/api/orders', (req, res) => {
  const { userId, status, search } = req.query;
  let filtered = [...orders];

  if (userId) {
    filtered = filtered.filter((o) => o.userId === userId);
  }
  if (status && status !== 'TODOS') {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.address.locality.toLowerCase().includes(q) ||
        o.address.address.toLowerCase().includes(q)
    );
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(filtered);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id.toUpperCase() === req.params.id.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado con el código proporcionado.' });
  }
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const {
    userId,
    customerName,
    customerPhone,
    customerEmail,
    address,
    items,
    pickupDate,
    pickupTime,
    deliveryFee,
    notes,
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'El pedido debe incluir al menos una prenda o servicio.' });
  }
  if (!address || !address.address) {
    return res.status(400).json({ error: 'La dirección de recogida es obligatoria.' });
  }

  const subtotal = items.reduce((acc: number, it: any) => acc + (Number(it.subtotal) || 0), 0);
  const fee = Number(deliveryFee) || 5000;
  const total = subtotal + fee;

  const orderId = req.body.id || `RE-2026-${String(orderCounter++).padStart(6, '0')}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    userId: userId || 'usr-guest',
    customerName: customerName || 'Cliente Ropa Express',
    customerPhone: customerPhone || '+57 310 000 0000',
    customerEmail: customerEmail || '',
    status: 'SOLICITADO',
    pickupDate: pickupDate || new Date().toISOString().split('T')[0],
    pickupTime: pickupTime || '8:00 a.m. - 10:00 a.m.',
    address: {
      id: address.id || `addr-${Date.now()}`,
      userId: userId || 'usr-guest',
      name: address.name || 'Dirección de recogida',
      address: address.address,
      neighborhood: address.neighborhood || '',
      locality: address.locality || 'Bogotá D.C.',
      city: address.city || 'Bogotá',
      latitude: address.latitude,
      longitude: address.longitude,
      notes: address.notes || '',
    },
    items: items.map((it: any, index: number) => {
      const q = Number(it.quantity) || 1;
      const uPrice = Number(it.unitPrice) || 0;
      const sTotal = Number(it.subtotal) !== undefined ? Number(it.subtotal) : q * uPrice;
      const addChg = Number(it.additionalCharge) || 0;
      const disc = Number(it.discount) || 0;
      const fPrice = Number(it.finalPrice) !== undefined ? Number(it.finalPrice) : Math.max(0, sTotal + addChg - disc);

      return {
        id: it.id || `item-${Date.now()}-${index}`,
        orderId,
        serviceId: it.serviceId || 'srv-1',
        serviceName: it.serviceName || 'Servicio textil',
        description: it.description || '',
        garmentType: it.garmentType,
        alterationType: it.alterationType,
        quantity: q,
        unit: it.unit || 'Prenda',
        unitPrice: uPrice,
        subtotal: sTotal,
        additionalCharge: addChg,
        discount: disc,
        finalPrice: fPrice,
        isEstimate: Boolean(it.isEstimate),
        photos: it.photos || [],
      };
    }),
    subtotal,
    deliveryFee: fee,
    total,
    notes: notes || '',
    createdAt: now,
    history: [
      {
        id: `h-${Date.now()}-1`,
        orderId,
        status: 'SOLICITADO',
        comment: 'Solicitud registrada exitosamente en Ropa Express Bogotá.',
        createdAt: now,
      },
    ],
  };

  orders.unshift(newOrder);

  // Generate in-app notification for user
  if (userId) {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId,
      orderId: newOrder.id,
      title: '¡Pedido recibido en Ropa Express!',
      message: `Tu solicitud ${newOrder.id} ha sido registrada. Programada para ${newOrder.pickupDate} (${newOrder.pickupTime}).`,
      type: 'order',
      read: false,
      createdAt: now,
    });
  }

  // If user is registered, save address if not already present
  if (userId && address.address) {
    if (!userAddresses[userId]) userAddresses[userId] = [];
    const exists = userAddresses[userId].some((a) => a.address === address.address);
    if (!exists) {
      userAddresses[userId].push(newOrder.address);
    }
  }

  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, comment, internalNotes, extraCharge } = req.body;

  const orderIndex = orders.findIndex((o) => o.id.toUpperCase() === id.toUpperCase());
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  const order = orders[orderIndex];
  const now = new Date().toISOString();

  if (status && status !== order.status) {
    order.status = status as OrderStatus;
    order.history.push({
      id: `h-${Date.now()}`,
      orderId: order.id,
      status: status as OrderStatus,
      comment: comment || `Estado actualizado a ${status}`,
      createdAt: now,
    });

    // Notify user of status update
    if (order.userId) {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: order.userId,
        orderId: order.id,
        title: `Actualización: ${status}`,
        message: comment || `Tu pedido ${order.id} cambió a estado ${status}.`,
        type: 'order',
        read: false,
        createdAt: now,
      });
    }
  }

  if (internalNotes !== undefined) {
    order.internalNotes = internalNotes;
  }

  if (extraCharge !== undefined) {
    const extra = Number(extraCharge) || 0;
    order.extraCharge = extra;
    order.total = order.subtotal + order.deliveryFee + extra;
  }

  orders[orderIndex] = order;
  res.json(order);
});

// Notifications endpoints
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json(notifications);
  const userNotifs = notifications.filter((n) => n.userId === userId);
  res.json(userNotifs);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true, notification: notif });
});

app.post('/api/notifications/dispatch-whatsapp', (req, res) => {
  const { phone, message, orderId } = req.body;
  // Simulated WhatsApp notification gateway dispatch log
  console.log(`[WhatsApp Gateway Dispatch] To: ${phone}, Order: ${orderId}, Msg: ${message}`);
  res.json({
    status: 'dispatched',
    channel: 'whatsapp',
    timestamp: new Date().toISOString(),
    recipient: phone,
    orderId,
  });
});

// -------------------------------------------------------------
// GEMINI AI INTEGRATION
// -------------------------------------------------------------

// 1. Text Assistant Endpoint
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  const ai = getGeminiClient();

  const catalogListText = services
    .filter((s) => s.active)
    .map(
      (s) =>
        `- ${s.name} (Categoría: ${s.category.toUpperCase()}): $${s.price.toLocaleString('es-CO')} COP por ${s.unit}${
          s.minimumPrice ? ` (Mínimo: $${s.minimumPrice.toLocaleString('es-CO')} COP)` : ''
        }${s.estimatedTime ? ` [Tiempo estimado: ${s.estimatedTime}]` : ''}${
          s.isEstimate ? ' [Precio estimado - requiere confirmación]' : ''
        }`
    )
    .join('\n');

  const zonesListText = deliveryZones
    .map((z) => `- ${z.locality}: Domicilio $${z.deliveryFee.toLocaleString('es-CO')} COP (${z.covered ? 'Cobertura activa' : 'Confirmar con asesor'})`)
    .join('\n');

  if (!ai) {
    // Dynamic calculation fallback using real database services
    const lower = prompt.toLowerCase();
    let reply = `Con gusto te asesoro. En Ropa Express Bogotá contamos con un catálogo oficial de servicios:\n• Lavado por kg: $${(services.find((s) => s.id === 'srv-1')?.price || 8000).toLocaleString('es-CO')} COP\n• Planchado por prenda: $${(services.find((s) => s.id === 'srv-2')?.price || 3000).toLocaleString('es-CO')} COP\n• Lavado + Planchado Camisa: $${(services.find((s) => s.id === 'srv-3')?.price || 4000).toLocaleString('es-CO')} COP.\nPara cotizaciones personalizadas o confirmación directa, puedes comunicarte con nuestro asesor ${ADVISOR_NAME} al Celular / WhatsApp: ${ADVISOR_PHONE}.`;
    let proposal = undefined;

    if (lower.includes('pantalón') || lower.includes('pantalon') || lower.includes('largo') || lower.includes('dobladillo')) {
      const srv = services.find((s) => s.id === 'srv-7') || services.find((s) => s.category === 'arreglos');
      const p = srv?.price || 8000;
      reply = `Para un pantalón que te queda largo, el servicio oficial es "${srv?.name || 'Dobladillo de pantalón'}" con un precio base de $${p.toLocaleString('es-CO')} COP (${srv?.unit || 'Arreglo'}). Tiempo estimado: ${srv?.estimatedTime || '48 a 72 hrs'}. Puedes contactar a nuestro asesor ${ADVISOR_NAME} al WhatsApp ${ADVISOR_PHONE} para coordinar la recogida.`;
      proposal = {
        services: [srv?.name || 'Dobladillo de pantalón o falda'],
        suggestedItems: [
          { serviceName: srv?.name || 'Dobladillo de pantalón o falda', quantity: 1, unitPrice: p, unit: srv?.unit || 'Arreglo', garmentType: 'Pantalón' },
        ],
        estimatedTotal: p,
      };
    } else if (lower.includes('camisa') || lower.includes('camisas')) {
      const matchNumber = prompt.match(/\b(\d+)\b/);
      const qty = matchNumber ? parseInt(matchNumber[1], 10) : 5;
      const srv = services.find((s) => s.id === 'srv-3') || services.find((s) => s.name.toLowerCase().includes('camisa'));
      const unitP = srv?.price || 4000;
      const totalP = unitP * qty;
      reply = `El servicio de "${srv?.name || 'Lavado + Planchado Camisa'}" tiene una tarifa oficial de $${unitP.toLocaleString('es-CO')} COP por ${srv?.unit || 'Prenda'}. Para ${qty} camisas, el valor total del servicio es de $${totalP.toLocaleString('es-CO')} COP.\n\nAsesor asignado: ${ADVISOR_NAME} (WhatsApp: ${ADVISOR_PHONE}).`;
      proposal = {
        services: [srv?.name || 'Lavado + Planchado Camisa'],
        suggestedItems: [
          { serviceName: srv?.name || 'Lavado + Planchado Camisa', quantity: qty, unitPrice: unitP, unit: srv?.unit || 'Prenda', garmentType: 'Camisa' },
        ],
        estimatedTotal: totalP,
      };
    } else if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuanto') || lower.includes('cuánto')) {
      // General price query
      reply = `En Ropa Express Bogotá manejamos tarifas oficiales transparentes. Aquí tienes algunos de nuestros servicios activos:\n\n${catalogListText.split('\n').slice(0, 6).join('\n')}\n\nSi necesitas un servicio no listado, nuestro asesor comercial ${ADVISOR_NAME} (Celular / WhatsApp: ${ADVISOR_PHONE}) confirmará el valor exacto.`;
    }

    return res.json({
      text: reply,
      proposal,
      source: 'catalog-service',
      advisor: { name: ADVISOR_NAME, phone: ADVISOR_PHONE },
    });
  }

  try {
    const systemInstruction = `
Eres el Asistente Inteligente Oficial de "ROPA EXPRESS BOGOTÁ", plataforma líder de lavandería, planchado y sastrería a domicilio en Bogotá, Colombia.
Asesor Comercial de Atención: ${ADVISOR_NAME} (Celular y WhatsApp: ${ADVISOR_PHONE}).

CATÁLOGO OFICIAL Y CENTRAL DE SERVICIOS (BASE DE DATOS EN TIEMPO REAL):
${catalogListText}

TARIFAS DE DOMICILIO POR LOCALIDAD:
${zonesListText}

DIRECTIVAS CRÍTICAS DE COTIZACIÓN Y PRECIOS:
1. NUNCA inventes precios. Utiliza EXCLUSIVAMENTE los valores numéricos del catálogo anterior.
2. Si el usuario pregunta por un cálculo (ej: "¿Cuánto cuesta lavar 5 camisas?"), multiplica la cantidad por el precio unitario del catálogo exacto (ej. 5 camisas × $4.000 = $20.000 COP) y desglose claramente: Cantidad × Precio unitario = Total.
3. Si el usuario solicita un servicio que NO aparece en el catálogo oficial o no hay información suficiente, responde textualmente:
"No encuentro un precio configurado para ese servicio. El administrador deberá confirmarlo. Puedes comunicarte directamente con nuestro asesor ${ADVISOR_NAME} al Celular / WhatsApp: ${ADVISOR_PHONE}."
4. Para servicios de sastrería o arreglos, indica que se trata de un "precio estimado" sujeto a confirmación física tras inspección de la prenda en taller.
5. Menciona amablemente al asesor ${ADVISOR_NAME} (WhatsApp: ${ADVISOR_PHONE}) cuando el cliente desee asesoría personalizada.
6. Si puedes estructurar una propuesta de orden a partir de la consulta, añade al final en una sola línea la instrucción:
PROPOSAL:{"services":["..."],"suggestedItems":[{"serviceName":"...","quantity":1,"unitPrice":4000,"unit":"Prenda","garmentType":"..."}],"estimatedTotal":...}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    let cleanText = rawText;
    let proposal = undefined;

    // Extract PROPOSAL json if present
    const proposalMatch = rawText.match(/PROPOSAL:\s*(\{.*\})/s);
    if (proposalMatch) {
      try {
        proposal = JSON.parse(proposalMatch[1]);
        cleanText = rawText.replace(/PROPOSAL:\s*\{.*\}/s, '').trim();
      } catch (e) {
        // ignore json parse error
      }
    }

    res.json({
      text: cleanText,
      proposal,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error calling Gemini:', error);
    res.status(500).json({
      error: 'Error al procesar la solicitud con el asistente.',
      details: error.message,
    });
  }
});

// 2. Garment Image Analysis Endpoint
app.post('/api/gemini/analyze-garment', async (req, res) => {
  const { imageBase64, mimeType, description } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'La fotografía de la prenda es requerida.' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      analysis: {
        garmentType: 'Prenda textil',
        alterationSuggested: 'Dobladillo o ajuste de costura',
        observations: 'Aparentemente la prenda requiere verificación manual en taller de confección.',
        estimatedPriceRange: '$8.000 - $15.000 COP',
        confidenceNotes: 'Análisis preliminar local. Nuestro sastre verificará la prenda físicamente en la recogida.',
      },
      source: 'fallback',
    });
  }

  try {
    const promptText = `
Analiza esta fotografía de una prenda de vestir para el taller de sastrería y lavandería de Ropa Express Bogotá.
Descripción adicional del usuario: "${description || 'Sin notas adicionales'}".

IMPORTANTE:
NO debes afirmar con certeza absoluta un daño que no puedas verificar de manera 100% concluyente.
Debes utilizar expresiones prudentes como "aparentemente", "posiblemente", "se observa".

Responde en formato JSON estricto con las siguientes claves:
{
  "garmentType": "Tipo de prenda identificado (ej: Pantalón jean, Camisa formal, Chaqueta, etc.)",
  "alterationSuggested": "Servicio de arreglo o lavado sugerido (ej: Dobladillo, Cambio de cremallera, Ajuste de cintura, Lavado delicado)",
  "observations": "Observaciones detalladas usando términos prudentes como 'aparentemente', 'posiblemente'",
  "estimatedPriceRange": "Rango estimado en COP (ej: $8.000 - $12.000 COP)",
  "confidenceNotes": "Nota indicando que el precio final se confirmará al examinar la prenda en persona"
}
`;

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const actualMimeType = mimeType || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: actualMimeType,
              data: cleanBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let analysisResult;
    try {
      analysisResult = JSON.parse(outputText);
    } catch (e) {
      analysisResult = {
        garmentType: 'Prenda identificada',
        alterationSuggested: 'Arreglo textil',
        observations: 'Aparentemente se observan detalles a tratar según la foto adjunta.',
        estimatedPriceRange: '$8.000 - $15.000 COP',
        confidenceNotes: 'Sujeto a verificación física durante la recogida.',
      };
    }

    res.json({
      analysis: analysisResult,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error analyzing image with Gemini:', error);
    res.status(500).json({
      error: 'Error al analizar la fotografía de la prenda.',
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC ASSETS
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ropa Express Bogotá] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
