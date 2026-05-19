export type Language = 'es' | 'en';
export type TemplateId = 'premium-brochure' | 'technical-sheet';

export interface AdvisorInfo {
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  website: string;
  whatsapp: string;
  logo?: string;
}

export interface PropertyFields {
  title: string;
  propertyType: string;
  location: string;
  price: string;
  operationType: string;   // EN VENTA / EN RENTA / For Sale / For Rent
  bedrooms: string;
  bathrooms: string;
  halfBaths: string;       // Medios baños
  builtArea: string;
  lotArea: string;
  parking: string;
  maintenance: string;     // Mantenimiento mensual
  yearBuilt: string;
  status: string;
  propertyId: string;      // ID interno
}

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  role: 'cover' | 'gallery';
}

export interface MarketingCopy {
  headline: string;
  subheadline: string;
  description: string;
  lifestyle: string;
  amenities: string[];
  highlights: string[];
  cta: string;
}

export interface AiExtractionResult {
  fields: PropertyFields;
  missingFields: string[];
  copy: Record<Language, MarketingCopy>;
}

export interface GenerationPayload {
  rawText: string;
  fields: PropertyFields;
  advisor: AdvisorInfo;
  images: UploadedImage[];
  template: TemplateId;
  copy?: Record<Language, MarketingCopy>;
}

export interface GeneratedPdf {
  language: Language;
  filename: string;
  base64: string;
  mimeType: 'application/pdf';
}
