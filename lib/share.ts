import type { AdvisorInfo, MarketingCopy, PropertyFields } from './types';

export interface ShareData {
  fields: PropertyFields;
  copy: Record<'es' | 'en', MarketingCopy>;
  advisor: AdvisorInfo;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  proposalUrl?: string;
  lang?: 'es' | 'en';
}

function clean(s?: string) { return (s ?? '').trim(); }
function has(s?: string) { return clean(s).length > 0; }
function cleanPhone(p?: string) { return (p ?? '').replace(/[\s\-().+]/g, ''); }

// ── Email ─────────────────────────────────────────────────────────────────────
export function buildEmailSubject(d: ShareData): string {
  const parts = [
    clean(d.fields.title) || (d.lang === 'en' ? 'Property Proposal' : 'Propuesta de inmueble'),
    clean(d.fields.location),
    clean(d.fields.price),
  ].filter(Boolean);
  const prefix = d.lang === 'en' ? 'Property proposal' : 'Propuesta de inmueble';
  return `${prefix}: ${parts.join(' · ')}`;
}

export function buildEmailBody(d: ShareData): string {
  const isEn = d.lang === 'en';
  const copy  = d.copy[d.lang ?? 'es'];
  const f     = d.fields;
  const adv   = d.advisor;

  const greeting    = has(d.clientName)
    ? (isEn ? `Hello ${d.clientName},` : `Hola ${d.clientName},`)
    : (isEn ? 'Hello,' : 'Hola,');
  const intro       = isEn
    ? 'I would like to share the following property proposal with you:'
    : 'Te comparto la siguiente propuesta de inmueble:';
  const highlights  = copy.highlights?.slice(0, 3) ?? [];
  const hlLabel     = isEn ? 'Key highlights:' : 'Puntos destacados:';
  const fileLabel   = isEn ? 'Full property sheet:' : 'Ficha completa:';
  const closing     = isEn
    ? 'I am available to answer any questions or schedule a visit.'
    : 'Quedo atento para resolver dudas o coordinar una visita.';
  const regards     = isEn ? 'Best regards,' : 'Saludos,';

  const rows = [
    has(f.location)  && `${isEn ? 'Location'     : 'Ubicación'}: ${f.location}`,
    has(f.price)     && `${isEn ? 'Price'         : 'Precio'}: ${f.price}`,
    has(f.bedrooms)  && `${isEn ? 'Bedrooms'      : 'Recámaras'}: ${f.bedrooms}`,
    has(f.bathrooms) && `${isEn ? 'Bathrooms'     : 'Baños'}: ${f.bathrooms}`,
    has(f.builtArea) && `${isEn ? 'Built area'    : 'Construcción'}: ${f.builtArea}`,
    has(f.lotArea)   && `${isEn ? 'Lot size'      : 'Terreno'}: ${f.lotArea}`,
    has(f.parking)   && `${isEn ? 'Parking'       : 'Estacionamiento'}: ${f.parking}`,
  ].filter(Boolean).join('\n');

  const hlLines = highlights.map(h => `- ${h}`).join('\n');

  return [
    greeting,
    '',
    intro,
    '',
    clean(f.title) || (isEn ? 'Property' : 'Inmueble'),
    rows,
    '',
    highlights.length ? `${hlLabel}\n${hlLines}` : '',
    '',
    has(d.proposalUrl) ? `${fileLabel}\n${d.proposalUrl}` : '',
    '',
    closing,
    '',
    regards,
    clean(adv.name),
    [clean(adv.position), clean(adv.company)].filter(Boolean).join(' · '),
    has(adv.phone) ? (isEn ? `Phone: ${adv.phone}` : `Tel: ${adv.phone}`) : '',
    has(adv.whatsapp) ? `WhatsApp: ${adv.whatsapp}` : '',
    has(adv.email) ? adv.email : '',
    has(adv.website) ? adv.website.replace(/^https?:\/\//, '') : '',
  ].filter((s): s is string => typeof s === 'string' && s !== '').join('\n').replace(/\n{3,}/g, '\n\n');
}

export function buildClipboardContent(d: ShareData): string {
  const subj = buildEmailSubject(d);
  const body = buildEmailBody(d);
  const isEn = d.lang === 'en';
  return `${isEn ? 'Subject' : 'Asunto'}: ${subj}\n\n${isEn ? 'Body' : 'Cuerpo'}:\n${body}`;
}

export function buildMailtoUrl(d: ShareData): string {
  const subject = buildEmailSubject(d);
  const body    = buildEmailBody(d);
  const to      = d.clientEmail ? encodeURIComponent(d.clientEmail) : '';
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
export function buildWhatsAppMessage(d: ShareData): string {
  const isEn = d.lang === 'en';
  const copy  = d.copy[d.lang ?? 'es'];
  const f     = d.fields;

  const greeting = has(d.clientName)
    ? (isEn ? `Hello ${d.clientName}! I'd like to share a property that might interest you:` : `Hola ${d.clientName}, te comparto una propiedad que puede interesarte:`)
    : (isEn ? "I'd like to share a property with you:" : 'Te comparto una propiedad:');

  const rows = [
    has(f.title)     && `*${f.title}*`,
    has(f.location)  && `📍 ${f.location}`,
    has(f.price)     && `💰 ${f.price}`,
    has(f.bedrooms)  && `🛏 ${f.bedrooms} ${isEn ? 'bedrooms' : 'recámaras'}`,
    has(f.bathrooms) && `🚿 ${f.bathrooms} ${isEn ? 'bathrooms' : 'baños'}`,
    has(f.builtArea) && `📐 ${f.builtArea} ${isEn ? 'built area' : 'de construcción'}`,
    has(f.parking)   && `🅿️ ${f.parking}`,
  ].filter(Boolean).join('\n');

  const highlights = copy.highlights?.slice(0, 3) ?? [];
  const hlLabel    = isEn ? '✨ Key highlights:' : '✨ Lo más relevante:';
  const hlLines    = highlights.map(h => `• ${h}`).join('\n');

  const urlLine = has(d.proposalUrl)
    ? `\n${isEn ? '📄 Full property sheet:' : '📄 Ficha completa:'}\n${d.proposalUrl}`
    : '';

  const cta = isEn
    ? 'Would you like to schedule a visit or discuss more details?'
    : '¿Te gustaría que coordinemos una visita o revisamos más detalles?';

  return [
    greeting,
    '',
    rows,
    '',
    highlights.length ? `${hlLabel}\n${hlLines}` : '',
    urlLine,
    '',
    cta,
  ].filter((s): s is string => typeof s === 'string').join('\n').replace(/\n{3,}/g, '\n\n');
}

export function buildWhatsAppUrl(d: ShareData): string {
  const msg   = buildWhatsAppMessage(d);
  const phone = cleanPhone(d.clientPhone);
  const base  = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(msg)}`;
}
