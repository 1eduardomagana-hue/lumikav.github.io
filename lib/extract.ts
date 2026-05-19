import { emptyFields, fallbackCopy, fieldLabels } from './defaults';
import type { AiExtractionResult, PropertyFields } from './types';

const patterns: Partial<Record<keyof PropertyFields, RegExp[]>> = {
  price: [/(?:precio|price)[:\s]+([^\n]+)/i, /([$€][\d.,\s]+)/],
  bedrooms: [/(?:habitaciones|bedrooms|beds|recámaras)[:\s]+(\d+)/i, /(\d+)\s*(?:habitaciones|bedrooms|beds|recámaras)/i],
  bathrooms: [/(?:baños|bathrooms|baths)[:\s]+(\d+)/i, /(\d+)\s*(?:baños|bathrooms|baths)/i],
  builtArea: [/(?:construidos|built area|interior|m2 construidos|área construida)[:\s]+([^\n]+)/i, /(\d+[\d.,]*\s*(?:m2|m²|sq\.?\s*ft))/i],
  lotArea: [/(?:terreno|lot|plot)[:\s]+([^\n]+)/i],
  parking: [/(?:parking|estacionamiento|garaje)[:\s]+([^\n]+)/i],
  location: [/(?:ubicación|location|zona)[:\s]+([^\n]+)/i],
  propertyType: [/(?:tipo|type)[:\s]+([^\n]+)/i],
  yearBuilt: [/(?:año|year built|built in)[:\s]+(\d{4})/i],
  status: [/(?:estado|status)[:\s]+([^\n]+)/i]
};

function pickLine(rawText: string) {
  return rawText.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
}

export function deterministicExtract(rawText: string, currentFields = emptyFields): AiExtractionResult {
  const fields: PropertyFields = { ...emptyFields, ...currentFields };
  const source = rawText.trim();
  if (!fields.title) fields.title = pickLine(source) || 'Signature Property';
  for (const [key, regexes] of Object.entries(patterns) as [keyof PropertyFields, RegExp[]][]) {
    if (fields[key]) continue;
    const match = regexes.map((regex) => source.match(regex)).find(Boolean);
    if (match?.[1]) fields[key] = match[1].trim().replace(/[.;]$/, '');
  }
  if (!fields.propertyType) {
    const lower = source.toLowerCase();
    fields.propertyType = lower.includes('villa') ? 'Villa' : lower.includes('apartment') || lower.includes('apartamento') ? 'Apartment' : '';
  }
  const missingFields = (Object.keys(fieldLabels) as (keyof PropertyFields)[]).filter((key) => !fields[key]);
  const base = fields.title || fields.propertyType || 'premium property';
  const location = fields.location ? ` in ${fields.location}` : '';
  const locationEs = fields.location ? ` en ${fields.location}` : '';
  return {
    fields,
    missingFields,
    copy: {
      es: { ...fallbackCopy.es, headline: `${base}: elegancia contemporánea${locationEs}`, subheadline: `${fields.propertyType || 'Propiedad'} exclusiva con espacios pensados para disfrutar cada día`, description: `${base} combina una presencia sofisticada con características prácticas para una vida cómoda y memorable.`, lifestyle: 'Una propuesta residencial orientada al bienestar: luz, amplitud y detalles que transforman cada ambiente en una experiencia de alto nivel.' },
      en: { ...fallbackCopy.en, headline: `${base}: contemporary elegance${location}`, subheadline: `An exclusive ${fields.propertyType || 'property'} designed for effortless everyday living`, description: `${base} brings together a sophisticated presence and practical features for a comfortable, memorable lifestyle.`, lifestyle: 'A residential offering centered on wellbeing: natural light, generous spaces, and details that turn every room into an elevated experience.' }
    }
  };
}
