import type { AdvisorInfo, ImageAnalysis, LocationInsight, MarketingCopy, PropertyFields, UploadedImage } from './types';

const L = {
  es: {
    forSale:'EN VENTA', forRent:'EN RENTA', priceOnRequest:'Precio bajo solicitud',
    bedrooms:'Recámaras', bathrooms:'Baños', halfBaths:'Medios baños',
    parking:'Estacionamientos', builtArea:'Construcción', lotArea:'Terreno',
    maintenance:'Mantenimiento', propertyId:'ID',
    description:'Descripción', amenities:'Amenidades', highlights:'Beneficios clave',
    photos:'Galería', page:'Página', of:'de',
    location:'Ubicación estratégica', preparedBy:'Preparado por',
    valueSentence:'Ficha preparada para presentar, compartir y facilitar la decisión de compra.',
    analyzeImages:'Analizar fotos con IA',
    analyzing:'Analizando fotos…',
  },
  en: {
    forSale:'FOR SALE', forRent:'FOR RENT', priceOnRequest:'Price on request',
    bedrooms:'Bedrooms', bathrooms:'Bathrooms', halfBaths:'Half baths',
    parking:'Parking', builtArea:'Built area', lotArea:'Lot size',
    maintenance:'Maintenance', propertyId:'ID',
    description:'Description', amenities:'Amenities', highlights:'Key benefits',
    photos:'Gallery', page:'Page', of:'of',
    location:'Strategic Location', preparedBy:'Prepared by',
    valueSentence:'Prepared to present, share and support better real estate decisions.',
    analyzeImages:'Analyze photos with AI',
    analyzing:'Analyzing photos…',
  }
};

const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const v   = (s?: string) => (s ?? '').trim();
const has = (s?: string) => v(s).length > 0;

function caption(analysis: ImageAnalysis | undefined, lang: 'es' | 'en'): { title: string; text: string } | null {
  if (!analysis) return null;
  const title = lang === 'es' ? analysis.captionTitleEs : analysis.captionTitleEn;
  const text  = lang === 'es' ? analysis.captionEs      : analysis.captionEn;
  if (!title && !text) return null;
  return { title: v(title), text: v(text) };
}

function imgWithCaption(img: UploadedImage | undefined, lang: 'es' | 'en', cssClass: string, placeholder = false): string {
  if (!img && !placeholder) return '';
  const cap = img ? caption(img.analysis, lang) : null;
  return `
<div class="${cssClass}">
  ${img
    ? `<img src="${img.dataUrl}" alt="${esc(cap?.title || '')}"/>`
    : '<div class="img-placeholder"></div>'}
  ${cap ? `
  <div class="img-caption">
    <div class="cap-title">${esc(cap.title)}</div>
    ${cap.text ? `<div class="cap-text">${esc(cap.text)}</div>` : ''}
  </div>` : ''}
</div>`;
}

function locationBlock(insights: LocationInsight[], lang: 'es' | 'en'): string {
  if (!insights.length) return '';
  const lbl = L[lang];
  const categories = [...new Set(insights.map(i => i.category))];
  return `
<div class="location-block">
  <div class="section-label">${lbl.location}</div>
  <div class="location-grid">
    ${categories.map(cat => {
      const items = insights.filter(i => i.category === cat);
      return `<div class="loc-category">
        <div class="loc-cat-name">${esc(cat)}</div>
        ${items.map(it => `<div class="loc-item">
          <span class="loc-dot">·</span>
          ${esc(it.name)}${it.distanceText ? ` <span class="loc-dist">${esc(it.distanceText)}</span>` : ''}
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>
</div>`;
}

function galleryPages(images: UploadedImage[], lang: 'es' | 'en', title: string): string {
  if (!images.length) return '';
  const lbl = L[lang];
  // Layout: 2 large per page if < 5 images, else 4 per page
  const perPage = images.length <= 4 ? 2 : 4;
  const chunks: UploadedImage[][] = [];
  for (let i = 0; i < images.length; i += perPage) chunks.push(images.slice(i, i + perPage));

  return chunks.map((chunk, pageIdx) => {
    const large = perPage === 2;
    return `
<div class="page gallery-page">
  <div class="gallery-page-header">
    <span class="gallery-page-title">${esc(title)}</span>
    <span class="gallery-page-label">${lbl.photos}</span>
  </div>
  <div class="gallery-grid${large ? ' large' : ' small'}">
    ${chunk.map(img => {
      const cap = caption(img.analysis, lang);
      return `
    <div class="gallery-item">
      <div class="gallery-img-wrap">
        <img src="${img.dataUrl}" alt="${esc(cap?.title || '')}"/>
      </div>
      ${cap ? `
      <div class="gallery-caption">
        <div class="gallery-cap-title">${esc(cap.title)}</div>
        <div class="gallery-cap-text">${esc(cap.text)}</div>
        ${img.analysis?.sellingPointsEs?.length ? `
        <ul class="gallery-bullets">
          ${(lang === 'es' ? img.analysis.sellingPointsEs : img.analysis.sellingPointsEn).slice(0, 3).map(p => `<li>${esc(p)}</li>`).join('')}
        </ul>` : ''}
      </div>` : ''}
    </div>`;
    }).join('')}
  </div>
  <div class="page-footer-bar">
    <span class="footer-brand">LumiKav Brochure Studio</span>
    <span class="footer-page">${lbl.page} ${pageIdx + 2}</span>
  </div>
</div>`;
  }).join('');
}

export function buildFlyerHtml(opts: {
  lang: 'es' | 'en';
  fields: PropertyFields;
  copy: MarketingCopy;
  advisor: AdvisorInfo;
  images: UploadedImage[];
}): string {
  const { lang, fields, copy, advisor, images } = opts;
  const lbl  = L[lang];
  const isEs = lang === 'es';

  const cover     = images.find(i => i.role === 'cover') ?? images[0];
  const secondary = images.filter(i => i !== cover).slice(0, 2);
  const extraImgs = images.filter(i => i !== cover && !secondary.includes(i));

  const title    = v(fields.title) || (isEs ? 'Propiedad destacada' : 'Featured property');
  const price    = v(fields.price) || lbl.priceOnRequest;
  const opType   = v(fields.operationType) || lbl.forSale;

  type MKey = 'bedrooms'|'bathrooms'|'halfBaths'|'parking'|'builtArea'|'lotArea'|'maintenance';
  const metricDefs: {key: MKey; label: string}[] = [
    {key:'bedrooms', label:lbl.bedrooms}, {key:'bathrooms', label:lbl.bathrooms},
    {key:'halfBaths', label:lbl.halfBaths}, {key:'parking', label:lbl.parking},
    {key:'builtArea', label:lbl.builtArea}, {key:'lotArea', label:lbl.lotArea},
    {key:'maintenance', label:lbl.maintenance},
  ];
  const metrics = metricDefs.filter(m => has(fields[m.key]));

  const descParts = (v(copy.description)||'').split(/\n+/).map(p=>p.trim()).filter(Boolean).slice(0,4);
  const locationInsights = copy.locationInsights ?? [];
  const valueSentence = v(copy.valueSentence) || lbl.valueSentence;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
img{display:block;max-width:100%;object-fit:cover}
:root{
  --green:#12372a;--deep:#071f1a;--gold:#c9a45c;
  --cream:#f7f1e6;--muted:#6b7280;--border:#e2ddd6;
  --serif:'Playfair Display',Georgia,serif;
  --sans:'Inter',system-ui,sans-serif;
}
html,body{background:#ddd9d3;font-family:var(--sans);color:var(--deep)}
.page{
  width:794px;background:#fff;margin:0 auto 28px;
  display:flex;flex-direction:column;overflow:hidden;
}
@media print{body{background:#fff}.page{margin:0;page-break-after:always}.page:last-child{page-break-after:avoid}}

/* HEADER */
.top-header{
  padding:22px 32px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
}
.th-title{font-family:var(--serif);font-size:26px;font-weight:700;line-height:1.1;color:var(--deep);max-width:360px}
.th-location{font-size:12px;color:var(--muted);margin-top:4px}
.th-type{font-size:11px;color:var(--muted);margin-top:2px}
.th-right{text-align:right;flex-shrink:0}
.th-price{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--green);white-space:nowrap}
.th-op-badge{display:inline-block;margin-top:5px;background:var(--green);color:#fff;font-size:8px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;padding:3px 9px;border-radius:99px}
.th-id{font-size:9.5px;color:var(--muted);margin-top:4px;letter-spacing:.4px}

/* MAIN GALLERY */
.main-gallery{display:grid;grid-template-columns:1.45fr 1fr;grid-template-rows:148px 148px;gap:3px;padding:0 32px;margin-top:14px}
.mg-cover{grid-row:span 2;overflow:hidden;border-radius:3px 0 0 3px;position:relative}
.mg-cover img{width:100%;height:100%}
.mg-sec{overflow:hidden;position:relative}
.mg-sec:first-of-type{border-radius:0 3px 0 0}
.mg-sec:last-of-type{border-radius:0 0 3px 0}
.img-placeholder{width:100%;height:100%;background:var(--cream)}

/* IMAGE CAPTIONS — overlay */
.img-caption{
  position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(to top,rgba(7,31,26,.82) 0%,rgba(7,31,26,.0) 100%);
  padding:22px 12px 9px;
}
.cap-title{font-size:10.5px;font-weight:600;color:#fff;letter-spacing:.3px;line-height:1.3}
.cap-text{font-size:9.5px;color:rgba(255,255,255,.78);margin-top:2px;line-height:1.4}

/* METRICS */
.metrics-strip{
  display:flex;flex-wrap:nowrap;overflow:hidden;
  margin:12px 32px 0;
  border:1px solid var(--border);border-radius:3px;
}
.metric{flex:1;min-width:0;padding:9px 8px;border-right:1px solid var(--border);text-align:center}
.metric:last-child{border-right:none}
.metric-val{font-size:15px;font-weight:700;color:var(--deep);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.metric-lbl{font-size:8px;font-weight:600;letter-spacing:1.3px;text-transform:uppercase;color:var(--muted);margin-top:3px}

/* CONTENT */
.content-cols{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;padding:16px 32px 0;flex:1}
.section-label{font-size:8.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.description{font-size:12px;line-height:1.72;color:#2a3230}
.description p+p{margin-top:8px}
.lifestyle{font-size:11.5px;line-height:1.65;color:var(--green);padding-left:11px;border-left:2px solid var(--gold);margin-top:10px}

/* LOCATION */
.location-block{margin-top:14px;padding:12px 14px;background:var(--cream);border-radius:3px;border-left:3px solid var(--gold)}
.location-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
.loc-category{}
.loc-cat-name{font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.loc-item{font-size:11px;color:var(--deep);line-height:1.6}
.loc-dot{color:var(--gold);margin-right:4px;font-weight:700}
.loc-dist{color:var(--muted);font-size:10px}

/* AMENITIES */
.amenities-list{display:flex;flex-wrap:wrap;gap:5px}
.amenity-tag{font-size:10.5px;font-weight:500;padding:4px 10px;border:1px solid var(--gold);color:var(--green);border-radius:99px;background:rgba(201,164,92,.06)}

/* HIGHLIGHTS */
.highlights-box{background:var(--deep);border-radius:3px;padding:14px 16px;margin-top:14px}
.highlights-box .section-label{color:var(--gold);margin-bottom:8px}
.hl-list{list-style:none}
.hl-item{display:flex;align-items:flex-start;gap:8px;font-size:11.5px;color:rgba(255,255,255,.88);padding:3px 0;line-height:1.5}
.hl-dot{flex-shrink:0;width:4px;height:4px;border-radius:50%;background:var(--gold);margin-top:5px}

/* ADVISOR FOOTER */
.advisor-bar{
  border-top:2px solid var(--gold);background:var(--cream);
  padding:14px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;
  margin-top:auto;
}
.adv-name{font-family:var(--serif);font-size:15px;font-weight:600;color:var(--deep);margin-bottom:2px}
.adv-meta{font-size:10.5px;color:var(--muted);line-height:1.7}
.adv-meta a{color:var(--gold);text-decoration:none}
.adv-cta{font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:var(--gold);margin-top:5px}
.adv-logo{max-width:78px;max-height:44px;object-fit:contain;flex-shrink:0}
.adv-value{font-size:9.5px;color:var(--muted);font-style:italic;margin-top:3px;max-width:320px;line-height:1.4}

/* PAGE FOOTER */
.page-footer-bar{display:flex;justify-content:space-between;align-items:center;padding:6px 32px;background:var(--deep)}
.footer-brand{font-size:8px;color:rgba(255,255,255,.35);letter-spacing:1.2px;text-transform:uppercase}
.footer-page{font-size:8px;color:rgba(255,255,255,.35)}

/* GALLERY PAGES */
.gallery-page{padding:0}
.gallery-page-header{display:flex;justify-content:space-between;align-items:baseline;padding:18px 32px 12px;border-bottom:1px solid var(--border)}
.gallery-page-title{font-family:var(--serif);font-size:15px;font-weight:600;color:var(--deep)}
.gallery-page-label{font-size:8.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted)}
.gallery-grid{display:grid;gap:12px;padding:16px 32px;flex:1}
.gallery-grid.large{grid-template-columns:1fr 1fr}
.gallery-grid.small{grid-template-columns:1fr 1fr;grid-template-rows:auto auto}
.gallery-item{display:flex;flex-direction:column;gap:8px}
.gallery-img-wrap{border-radius:3px;overflow:hidden;aspect-ratio:4/3}
.gallery-img-wrap img{width:100%;height:100%}
.gallery-caption{}
.gallery-cap-title{font-size:11px;font-weight:600;color:var(--deep);margin-bottom:2px}
.gallery-cap-text{font-size:10.5px;color:var(--muted);line-height:1.55}
.gallery-bullets{list-style:none;margin-top:5px;display:flex;flex-wrap:wrap;gap:4px}
.gallery-bullets li{font-size:9.5px;color:var(--green);background:rgba(201,164,92,.1);border:1px solid rgba(201,164,92,.3);padding:2px 8px;border-radius:99px}
</style>
</head>
<body>

<div class="page">
  <!-- HEADER -->
  <div class="top-header">
    <div>
      <div class="th-title">${esc(title)}</div>
      ${has(fields.location) ? `<div class="th-location">${esc(fields.location)}</div>` : ''}
      ${has(fields.propertyType) ? `<div class="th-type">${esc(fields.propertyType)}</div>` : ''}
    </div>
    <div class="th-right">
      <div class="th-price">${esc(price)}</div>
      <span class="th-op-badge">${esc(opType)}</span>
      ${has(fields.propertyId) ? `<div class="th-id">${esc(lbl.propertyId)}: ${esc(fields.propertyId)}</div>` : ''}
    </div>
  </div>

  <!-- MAIN GALLERY -->
  ${images.length > 0 ? `
  <div class="main-gallery">
    ${imgWithCaption(cover, lang, 'mg-cover')}
    ${imgWithCaption(secondary[0], lang, 'mg-sec', true)}
    ${imgWithCaption(secondary[1], lang, 'mg-sec', true)}
  </div>` : ''}

  <!-- METRICS -->
  ${metrics.length ? `
  <div class="metrics-strip">
    ${metrics.map(m => `<div class="metric"><div class="metric-val">${esc(fields[m.key])}</div><div class="metric-lbl">${esc(m.label)}</div></div>`).join('')}
  </div>` : ''}

  <!-- CONTENT COLS -->
  <div class="content-cols">
    <div>
      <div class="section-label">${lbl.description}</div>
      <div class="description">
        ${descParts.map(p => `<p>${esc(p)}</p>`).join('')}
        ${has(copy.lifestyle) ? `<p class="lifestyle">${esc(copy.lifestyle)}</p>` : ''}
      </div>
      ${locationInsights.length ? locationBlock(locationInsights, lang) : ''}
    </div>
    <div>
      ${copy.amenities?.length ? `
      <div class="section-label">${lbl.amenities}</div>
      <div class="amenities-list">${copy.amenities.slice(0,14).map(a=>`<span class="amenity-tag">${esc(a)}</span>`).join('')}</div>` : ''}
      ${copy.highlights?.length ? `
      <div class="highlights-box">
        <div class="section-label">${lbl.highlights}</div>
        <ul class="hl-list">
          ${copy.highlights.slice(0,6).map(h=>`<li class="hl-item"><span class="hl-dot"></span>${esc(h)}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>
  </div>

  <!-- ADVISOR -->
  <div class="advisor-bar">
    <div>
      <div class="adv-name">${esc(v(advisor.name))}</div>
      <div class="adv-meta">
        ${[advisor.position, advisor.company].filter(has).map(esc).join(' · ')}
        ${has(advisor.phone) ? `<br/>${esc(advisor.phone)}` : ''}
        ${has(advisor.email) ? ` · ${esc(advisor.email)}` : ''}
        ${has(advisor.whatsapp) ? `<br/>WhatsApp ${esc(advisor.whatsapp)}` : ''}
        ${has(advisor.website) ? ` · <a href="${esc(advisor.website)}">${esc(advisor.website.replace(/^https?:\/\//,''))}</a>` : ''}
      </div>
      <div class="adv-cta">${esc(v(copy.cta) || (isEs ? 'Agende una visita privada' : 'Schedule a private viewing'))}</div>
      <div class="adv-value">${esc(valueSentence)}</div>
    </div>
    ${has(advisor.logo) ? `<img class="adv-logo" src="${advisor.logo}" alt="logo"/>` : ''}
  </div>

  <div class="page-footer-bar">
    <span class="footer-brand">LumiKav Brochure Studio</span>
    <span class="footer-page">${lbl.page} 1</span>
  </div>
</div>

${galleryPages(extraImgs, lang, title)}

</body>
</html>`;
}
