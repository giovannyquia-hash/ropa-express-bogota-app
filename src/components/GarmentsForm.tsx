import React, { useRef } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Shirt,
  Info,
  Layers,
} from 'lucide-react';
import { GarmentItem } from '../services/whatsappService';
import {
  OFFICIAL_GARMENT_TYPES,
  OFFICIAL_ALTERATIONS,
  getCatalogServiceDetails,
} from '../services/catalogService';
import { formatCOP } from '../utils/formatters';
import { ServiceItem } from '../types';

export interface GarmentsFormProps {
  items: GarmentItem[];
  onChangeItems: (items: GarmentItem[]) => void;
  availableServices?: ServiceItem[];
}

export const GarmentsForm: React.FC<GarmentsFormProps> = ({
  items,
  onChangeItems,
  availableServices = [],
}) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const isGarmentsComplete =
    items.length > 0 &&
    items.every(
      (it) =>
        it.garmentType &&
        it.garmentType.trim() !== '' &&
        it.service &&
        it.service.trim() !== '' &&
        it.quantity > 0 &&
        it.unitPrice >= 0
    );

  const isGarmentsStarted = items.length > 0;

  // Actualizar un ítem específico
  const updateItem = (index: number, changes: Partial<GarmentItem>) => {
    const updated = [...items];
    const current = updated[index];
    const nextItem = { ...current, ...changes };

    // Si cambia tipo de prenda o servicio, recalcular precio unitario automáticamente del catálogo
    if (changes.garmentType !== undefined || changes.service !== undefined) {
      const gType = changes.garmentType !== undefined ? changes.garmentType : current.garmentType;
      const sName = changes.service !== undefined ? changes.service : current.service;
      const details = getCatalogServiceDetails(gType, sName, availableServices);

      nextItem.unitPrice = details.unitPrice;
      nextItem.isEstimate = details.isEstimate;
      nextItem.unit = details.unit;
    }

    // Fórmula: subtotalItem = quantity × unitPrice
    nextItem.subtotal = (nextItem.quantity || 1) * (nextItem.unitPrice || 0);

    updated[index] = nextItem;
    onChangeItems(updated);
  };

  // Agregar una nueva prenda independiente
  const handleAddGarment = () => {
    const defaultDetails = getCatalogServiceDetails('Pantalón', 'Dobladillo', availableServices);
    const newItem: GarmentItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      garmentType: 'Pantalón',
      service: 'Dobladillo',
      description: '',
      quantity: 1,
      unitPrice: defaultDetails.unitPrice,
      subtotal: defaultDetails.unitPrice * 1,
      photos: [],
      isEstimate: defaultDetails.isEstimate,
      unit: defaultDetails.unit,
    };
    onChangeItems([...items, newItem]);
  };

  // Eliminar una prenda
  const handleRemoveGarment = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChangeItems(updated);
  };

  // Manejar subida de fotografías (en base64) para una prenda
  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Limitar a tamaño razonable
      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen "${file.name}" supera los 5MB. Por favor selecciona una imagen más liviana.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const currentPhotos = items[index].photos || [];
          updateItem(index, { photos: [...currentPhotos, result] });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Eliminar fotografía de una prenda
  const handleRemovePhoto = (itemIndex: number, photoIndex: number) => {
    const currentPhotos = items[itemIndex].photos || [];
    const filtered = currentPhotos.filter((_, i) => i !== photoIndex);
    updateItem(itemIndex, { photos: filtered });
  };

  return (
    <div id="card-prendas-arreglo" className="space-y-6">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs transition hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-blue-950 uppercase tracking-tight">
                PRENDAS PARA ARREGLO
              </h3>
              <p className="text-xs text-slate-500">Agrega cada prenda con su tipo de arreglo, cantidad y descripción</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGarmentsComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✓ Completo ({items.length})</span>
              </span>
            ) : isGarmentsStarted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>● En proceso</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                <span>○ Pendiente</span>
              </span>
            )}
          </div>
        </div>

        {/* List of Garment Cards */}
        <div className="space-y-6 mt-6">
          {items.map((item, index) => {
            const itemNumber = index + 1;
            const itemPhotos = item.photos || [];

            return (
              <div
                key={item.id || `garment-${index}`}
                className="bg-slate-50/60 rounded-2xl p-4 sm:p-6 border border-slate-200 relative transition hover:border-slate-300"
              >
                {/* Header of Item */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-blue-950 text-white flex items-center justify-center text-xs font-extrabold">
                      {itemNumber}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-blue-950">
                      Prenda {itemNumber}: <span className="text-sky-800">{item.garmentType}</span>
                    </h4>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGarment(index)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                      title="Eliminar esta prenda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eliminar prenda</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                  {/* PASO 2: Tipo de prenda */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipo de prenda <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.garmentType}
                      onChange={(e) => updateItem(index, { garmentType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {OFFICIAL_GARMENT_TYPES.map((gt) => (
                        <option key={gt} value={gt}>
                          {gt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PASO 3: Tipo de arreglo */}
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipo de arreglo o servicio <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.service}
                      onChange={(e) => updateItem(index, { service: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {OFFICIAL_ALTERATIONS.map((alt) => (
                        <option key={alt.id} value={alt.name}>
                          {alt.name} - {formatCOP(alt.basePrice)} {alt.isEstimate ? '(Estimado)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PASO 4: Cantidad */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Cantidad <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-slate-700 transition"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-extrabold text-sm text-blue-950">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItem(index, { quantity: item.quantity + 1 })}
                        className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 hover:bg-sky-200 text-sky-900 flex items-center justify-center font-bold transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pricing line preview */}
                  <div className="md:col-span-12 bg-white p-3 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Precio unitario:</span>
                      <span className="font-extrabold text-slate-900">{formatCOP(item.unitPrice)}</span>
                      {item.isEstimate && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Precio estimado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-slate-500">Subtotal prenda:</span>
                      <span className="text-sm font-extrabold text-sky-800">
                        {item.quantity} × {formatCOP(item.unitPrice)} = {formatCOP(item.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* PASO 5: Descripción de la prenda */}
                  <div className="md:col-span-12">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Descripción del arreglo o problema <span className="text-slate-400 font-normal">(Se conservará exactamente)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      placeholder='Ej. "El pantalón me queda 4 cm largo.", "Necesito reducir la cintura.", "Se dañó la cremallera."'
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    />
                  </div>

                  {/* PASO 6: Agregar fotografía */}
                  <div className="md:col-span-12">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Fotografías de la prenda <span className="text-slate-400 font-normal">({itemPhotos.length} adjuntas)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[item.id || index]?.click()}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200/80 flex items-center gap-1.5 transition"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-600" />
                        <span>+ Agregar fotografía</span>
                      </button>
                    </div>

                    <input
                      ref={(el) => {
                        fileInputRefs.current[item.id || index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(index, e)}
                      className="hidden"
                    />

                    {/* Photo Thumbnails */}
                    {itemPhotos.length > 0 ? (
                      <div className="flex flex-wrap gap-3 mt-2 p-3 bg-white rounded-xl border border-slate-200/80">
                        {itemPhotos.map((photo, photoIdx) => (
                          <div key={photoIdx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                            <img
                              src={photo}
                              alt={`Prenda ${itemNumber} foto ${photoIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index, photoIdx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition shadow"
                              title="Eliminar foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Puedes subir fotos del detalle que deseas reparar o arreglar para que el maestro sastre lo inspeccione.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón "+ Agregar otra prenda" */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Cada prenda es un objeto independiente y su subtotal se calcula en tiempo real.
          </p>

          <button
            type="button"
            id="button-add-another-garment"
            onClick={handleAddGarment}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-blue-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 active:scale-95 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-blue-950" />
            <span>+ Agregar otra prenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
