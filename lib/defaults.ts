import type { AdvisorInfo, MarketingCopy, PropertyFields } from './types';

export const emptyFields: PropertyFields = {
  title: '', propertyType: '', location: '', price: '', operationType: '',
  bedrooms: '', bathrooms: '', halfBaths: '', builtArea: '', lotArea: '',
  parking: '', maintenance: '', yearBuilt: '', status: '', propertyId: ''
};

export const defaultAdvisor: AdvisorInfo = {
  name: 'Martha Fitzmaurice',
  position: 'Asesora Inmobiliaria Certificada',
  company: '',
  phone: '',
  whatsapp: '9992397480',
  email: 'marthafitz65@gmail.com',
  website: '',
};

export const fallbackCopy: Record<'es' | 'en', MarketingCopy> = {
  es: {
    headline: 'Residencia excepcional para vivir con estilo',
    subheadline: 'Diseño, confort y ubicación en perfecta armonía',
    description: 'Una propiedad cuidadosamente presentada para compradores exigentes que valoran la calidad, la privacidad y los detalles bien resueltos.',
    lifestyle: 'Disfrute espacios luminosos, ambientes fluidos y una experiencia residencial pensada para elevar la vida diaria con una estética elegante y atemporal.',
    amenities: ['Terraza', 'Cocina equipada', 'Luz natural', 'Estacionamiento'],
    highlights: ['Distribución funcional', 'Acabados premium', 'Excelente conectividad', 'Alto potencial de valor'],
    cta: 'Agende una visita privada'
  },
  en: {
    headline: 'An exceptional residence crafted for refined living',
    subheadline: 'Design, comfort, and location in perfect balance',
    description: 'A carefully presented property for discerning buyers who value quality, privacy, and thoughtful details.',
    lifestyle: 'Enjoy light-filled spaces, effortless flow, and a residential experience designed to elevate everyday living with timeless elegance.',
    amenities: ['Terrace', 'Equipped kitchen', 'Natural light', 'Parking'],
    highlights: ['Functional layout', 'Premium finishes', 'Excellent connectivity', 'Strong value potential'],
    cta: 'Schedule a private viewing'
  }
};

export const fieldLabels: Record<keyof PropertyFields, string> = {
  title: 'Property name', propertyType: 'Property type', location: 'Location',
  price: 'Price', operationType: 'Operation', bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms', halfBaths: 'Half baths', builtArea: 'Built area',
  lotArea: 'Lot area', parking: 'Parking', maintenance: 'Maintenance',
  yearBuilt: 'Year built', status: 'Status', propertyId: 'Property ID'
};

export const fieldLabelsEs: Record<keyof PropertyFields, string> = {
  title: 'Nombre', propertyType: 'Tipo', location: 'Ubicación',
  price: 'Precio', operationType: 'Operación', bedrooms: 'Recámaras',
  bathrooms: 'Baños', halfBaths: 'Medios baños', builtArea: 'Construcción',
  lotArea: 'Terreno', parking: 'Estacionamientos', maintenance: 'Mantenimiento',
  yearBuilt: 'Año', status: 'Estado', propertyId: 'ID'
};
