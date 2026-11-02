import { ServiceItem } from '../types';
import { INITIAL_SERVICES } from '../config/constants';

export const OFFICIAL_GARMENT_TYPES = [
  'Pantalón',
  'Jean',
  'Camisa',
  'Vestido',
  'Chaqueta',
  'Falda',
  'Blusa',
  'Traje',
  'Otra',
] as const;

export type OfficialGarmentType = (typeof OFFICIAL_GARMENT_TYPES)[number];

export interface AlterationOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  isEstimate: boolean;
  serviceId: string;
}

export const OFFICIAL_ALTERATIONS: AlterationOption[] = [
  {
    id: 'dobladillo',
    name: 'Dobladillo',
    description: 'Ajuste exacto de basta, puntada original o invisible.',
    basePrice: 8000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-7',
  },
  {
    id: 'ajuste-cintura',
    name: 'Ajuste de cintura',
    description: 'Entallado o ampliación precisa según medida.',
    basePrice: 12000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-10',
  },
  {
    id: 'ajuste-largo',
    name: 'Ajuste de largo',
    description: 'Subir o bajar largo manteniendo corte original.',
    basePrice: 8000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-7',
  },
  {
    id: 'ajuste-manga',
    name: 'Ajuste de manga',
    description: 'Acortar o entallar mangas de camisa, chaqueta o vestido.',
    basePrice: 10000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-6',
  },
  {
    id: 'cambio-cremallera',
    name: 'Cambio de cremallera',
    description: 'Sustitución con cremallera reforzada metálica o nylon.',
    basePrice: 15000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-8',
  },
  {
    id: 'cambio-boton',
    name: 'Cambio de botón',
    description: 'Colocación reforzada de botón o broche.',
    basePrice: 3000,
    unit: 'Unidad',
    isEstimate: false,
    serviceId: 'srv-9',
  },
  {
    id: 'reparacion-costura',
    name: 'Reparación de costura',
    description: 'Puntada de refuerzo en rotos, descocidos o aberturas.',
    basePrice: 8000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-7',
  },
  {
    id: 'lavado-planchado',
    name: 'Lavado + Planchado',
    description: 'Lavado delicado y planchado artesanal en gancho.',
    basePrice: 5000,
    unit: 'Prenda',
    isEstimate: false,
    serviceId: 'srv-4',
  },
  {
    id: 'planchado-solo',
    name: 'Planchado fino',
    description: 'Vaporizado y alisado profesional sin arrugas.',
    basePrice: 3000,
    unit: 'Prenda',
    isEstimate: false,
    serviceId: 'srv-2',
  },
  {
    id: 'otro',
    name: 'Otro',
    description: 'Reparación personalizada sujeta a inspección por el sastre.',
    basePrice: 10000,
    unit: 'Arreglo',
    isEstimate: true,
    serviceId: 'srv-7',
  },
];

/**
 * Obtiene el precio real catalogado según tipo de prenda y arreglo
 */
export function getCatalogServiceDetails(
  garmentType: string,
  alterationName: string,
  availableServices: ServiceItem[] = INITIAL_SERVICES
): {
  serviceId: string;
  unitPrice: number;
  unit: string;
  isEstimate: boolean;
} {
  // Manejo especial de combos según tipo de prenda
  if (alterationName === 'Lavado + Planchado') {
    if (garmentType === 'Camisa' || garmentType === 'Blusa') {
      const srv = availableServices.find((s) => s.id === 'srv-3') || INITIAL_SERVICES.find((s) => s.id === 'srv-3');
      return { serviceId: 'srv-3', unitPrice: srv?.price || 4000, unit: 'Prenda', isEstimate: false };
    }
    if (garmentType === 'Pantalón' || garmentType === 'Jean' || garmentType === 'Falda') {
      const srv = availableServices.find((s) => s.id === 'srv-4') || INITIAL_SERVICES.find((s) => s.id === 'srv-4');
      return { serviceId: 'srv-4', unitPrice: srv?.price || 5000, unit: 'Prenda', isEstimate: false };
    }
    if (garmentType === 'Vestido') {
      const srv = availableServices.find((s) => s.id === 'srv-5') || INITIAL_SERVICES.find((s) => s.id === 'srv-5');
      return { serviceId: 'srv-5', unitPrice: srv?.price || 8000, unit: 'Prenda', isEstimate: false };
    }
    if (garmentType === 'Chaqueta') {
      const srv = availableServices.find((s) => s.id === 'srv-6') || INITIAL_SERVICES.find((s) => s.id === 'srv-6');
      return { serviceId: 'srv-6', unitPrice: srv?.price || 10000, unit: 'Prenda', isEstimate: false };
    }
    if (garmentType === 'Traje') {
      const srv = availableServices.find((s) => s.id === 'srv-13') || INITIAL_SERVICES.find((s) => s.id === 'srv-13');
      return { serviceId: 'srv-13', unitPrice: srv?.price || 18000, unit: 'Prenda', isEstimate: false };
    }
  }

  // Buscar por coincidencia en OFFICIAL_ALTERATIONS
  const foundAlt = OFFICIAL_ALTERATIONS.find(
    (alt) => alt.name.toLowerCase() === alterationName.toLowerCase() || alt.id === alterationName.toLowerCase()
  );

  if (foundAlt) {
    // Si existe un servicio dinámico en availableServices con ese serviceId, tomar su precio actualizado
    const dyn = availableServices.find((s) => s.id === foundAlt.serviceId);
    return {
      serviceId: foundAlt.serviceId,
      unitPrice: dyn?.price ?? foundAlt.basePrice,
      unit: dyn?.unit ?? foundAlt.unit,
      isEstimate: foundAlt.isEstimate,
    };
  }

  // Fallback a dobladillo estándar
  return {
    serviceId: 'srv-7',
    unitPrice: 8000,
    unit: 'Arreglo',
    isEstimate: true,
  };
}
