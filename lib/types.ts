export type Language = 'es' | 'en';
export type TemplateId = 'premium-brochure' | 'technical-sheet';

export interface AdvisorInfo {
  name: string; phone: string; email: string; company: string;
  position: string; website: string; whatsapp: string; logo?: string;
}

export interface PropertyFields {
  title: string; propertyType: string; location: string;
  price: string; operationType: string;
  bedrooms: string; bathrooms: string; halfBaths: string;
  builtArea: string; lotArea: string; parking: string;
  maintenance: string; yearBuilt: string; status: string; propertyId: string;
}

export interface ImageAnalysis {
  imageId: string;
  detectedArea: string;           // "Sala-comedor", "Cocina", "Recámara principal"…
  captionTitleEs: string;
  captionEs: string;
  captionTitleEn: string;
  captionEn: string;
  sellingPointsEs: string[];      // máx 3 bullets observados
  sellingPointsEn: string[];
  recommendedUse: 'cover' | 'main_gallery' | 'gallery' | 'amenity' | 'detail';
}

export interface LocationInsight {
  name: string;
  category: string;               // "Hospital", "Escuela", "Centro comercial"…
  distanceText?: string;          // solo si viene de fuente verificada
  source: 'manual' | 'web_search';
}

export interface UploadedImage {
  id: string; name: string; dataUrl: string;
  role: 'cover' | 'gallery';
  analysis?: ImageAnalysis;       // populated after AI analysis
}

export interface MarketingCopy {
  headline: string; subheadline: string; description: string;
  lifestyle: string; amenities: string[]; highlights: string[]; cta: string;
  locationInsights?: LocationInsight[];
  valueSentence?: string;         // frase comercial para footer
}

export interface AiExtractionResult {
  fields: PropertyFields;
  missingFields: string[];
  copy: Record<Language, MarketingCopy>;
}

export interface GenerationPayload {
  rawText: string; fields: PropertyFields; advisor: AdvisorInfo;
  images: UploadedImage[]; template: TemplateId;
  copy?: Record<Language, MarketingCopy>;
}

export interface GeneratedPdf {
  language: Language; filename: string; base64: string; mimeType: 'application/pdf';
}
