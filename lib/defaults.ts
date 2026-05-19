import type { AdvisorInfo, MarketingCopy, PropertyFields } from './types';

export const emptyFields: PropertyFields = {
  title: '', propertyType: '', location: '', price: '', bedrooms: '',
  bathrooms: '', builtArea: '', lotArea: '', parking: '', yearBuilt: '', status: ''
};

export const defaultAdvisor: AdvisorInfo = {
  name: 'Isabella Rivera', phone: '+34 600 000 000', email: 'advisor@example.com',
  company: 'Lumi Kav Estates', position: 'Luxury Property Advisor',
  website: 'www.lumikav.com', whatsapp: '+34 600 000 000'
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
  price: 'Price', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', builtArea: 'Built area',
  lotArea: 'Lot area', parking: 'Parking', yearBuilt: 'Year built', status: 'Status'
};
