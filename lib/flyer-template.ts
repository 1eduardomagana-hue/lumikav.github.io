import type { AdvisorInfo, MarketingCopy, PropertyFields, UploadedImage } from './types';

// ── Labels ──────────────────────────────────────────────────────────────────
const L = {
  es: {
    forSale: 'EN VENTA', forRent: 'EN RENTA', priceOnRequest: 'Precio bajo solicitud',
    bedrooms: 'Recámaras', bathrooms: 'Baños', halfBaths: 'Medios baños',
    parking: 'Estacionamientos', builtArea: 'Construcción', lotArea: 'Terreno',
    maintenance: 'Mantenimiento', propertyId: 'ID', description: 'Descripción',
    amenities: 'Amenidades', highlights: 'Beneficios clave', photos: 'Galería',
    page: 'Página', of: 'de',
  },
  en: {
    forSale: 'FOR SALE', forRent: 'FOR RENT', priceOnRequest: 'Price on request',
    bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', halfBaths: 'Half baths',
    parking: 'Parking', builtArea: 'Built area', lotArea: 'Lot size',
    maintenance: 'Maintenance', propertyId: 'ID', description: 'Description',
    amenities: 'Amenities', highlights: 'Key benefits', photos: 'Gallery',
    page: 'Page', of: 'of',
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&(?!amp;|lt;|gt;)/g, '&amp;');
const v   = (s?: string) => (s ?? '').trim();
const has = (s?: string) => v(s).length > 0;

function metricCell(label: string, value: string): string {
  return `<div class="metric"><div class="metric-val">${esc(value)}</div><div class="metric-lbl">${esc(label)}</div></div>`;
}

function amenityItem(text: string): string {
  return `<span class="amenity-tag">${esc(text)}</span>`;
}

function highlightItem(text: string): string {
  return `<li class="hl-item"><span class="hl-dot"></span>${esc(text)}</li>`;
}

// ── Gallery pages (page 2+) ──────────────────────────────────────────────────
function galleryPages(images: UploadedImage[], lang: 'es' | 'en', propertyTitle: string): string {
  if (!images.length) return '';
  const lbl = L[lang];
  const chunks: UploadedImage[][] = [];
  for (let i = 0; i < images.length; i += 4) chunks.push(images.slice(i, i + 4));

  return chunks.map((chunk, pageIdx) => `
  <div class="page gallery-page">
    <div class="gallery-page-header">
      <span class="gallery-page-title">${esc(propertyTitle)}</span>
      <span class="gallery-page-label">${lbl.photos}</span>
    </div>
    <div class="gallery-grid cols-${Math.min(chunk.length, 2)}">
      ${chunk.map(img => `<div class="gallery-item"><img src="${img.dataUrl}" alt=""/></div>`).join('')}
    </div>
    <div class="page-footer-bar">
      <span class="footer-brand">LumiKav Brochure Studio</span>
      <span class="footer-page">${lbl.page} ${pageIdx + 2}</span>
    </div>
  </div>`).join('');
}

// ── Main export ──────────────────────────────────────────────────────────────
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

  // Images
  const cover     = images.find(i => i.role === 'cover') ?? images[0];
  const secondary = images.filter(i => i !== cover).slice(0, 2);
  const extraImgs = images.filter(i => i !== cover && !secondary.includes(i));

  // Header data
  const title     = v(fields.title) || (isEs ? 'Propiedad destacada' : 'Featured property');
  const location  = v(fields.location);
  const rawPrice  = v(fields.price);
  const price     = rawPrice || lbl.priceOnRequest;
  const opType    = v(fields.operationType) || (isEs ? lbl.forSale : lbl.forSale);
  const propId    = v(fields.propertyId);

  // Metrics strip — only filled ones
  type MetricDef = { key: keyof PropertyFields; label: string };
  const metricDefs: MetricDef[] = [
    { key: 'bedrooms',  label: lbl.bedrooms },
    { key: 'bathrooms', label: lbl.bathrooms },
    { key: 'halfBaths', label: lbl.halfBaths },
    { key: 'parking',   label: lbl.parking },
    { key: 'builtArea', label: lbl.builtArea },
    { key: 'lotArea',   label: lbl.lotArea },
    { key: 'maintenance', label: lbl.maintenance },
  ];
  const metrics = metricDefs.filter(m => has(fields[m.key]));

  // Description paragraphs — split on newlines if present
  const descParagraphs = (v(copy.description) || '')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .slice(0, 5);

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
/* ── Reset ──────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
img{display:block;max-width:100%}

/* ── Tokens ─────────────────────────────── */
:root{
  --green:#12372a; --deep:#071f1a; --gold:#c9a45c;
  --cream:#f7f1e6; --muted:#6b7280; --border:#e2ddd6;
  --bg:#fff; --text:#1a2320;
  --serif:'Playfair Display',Georgia,serif;
  --sans:'Inter',system-ui,sans-serif;
  --r:3px;
}

/* ── Page shell ─────────────────────────── */
html,body{background:#e8e4de;font-family:var(--sans);color:var(--text)}
.page{
  width:794px; min-height:1123px;
  background:var(--bg);
  margin:0 auto 32px;
  display:flex; flex-direction:column;
  overflow:hidden;
  position:relative;
}
@media print{
  body{background:#fff}
  .page{margin:0;page-break-after:always;box-shadow:none}
  .page:last-child{page-break-after:avoid}
}

/* ── TOP HEADER ─────────────────────────── */
.top-header{
  padding:28px 36px 20px;
  border-bottom:1px solid var(--border);
  display:flex; align-items:flex-start; justify-content:space-between; gap:16px;
}
.th-left{flex:1;min-width:0}
.th-title{
  font-family:var(--serif);
  font-size:28px; font-weight:700; line-height:1.1;
  color:var(--deep); margin-bottom:5px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.th-location{font-size:13px; color:var(--muted); font-weight:400; letter-spacing:.3px}
.th-type{font-size:12px; color:var(--muted); margin-top:3px}
.th-right{text-align:right; flex-shrink:0}
.th-price{
  font-family:var(--serif);
  font-size:22px; font-weight:700; color:var(--green); white-space:nowrap;
}
.th-op-badge{
  display:inline-block; margin-top:6px;
  background:var(--green); color:#fff;
  font-size:9px; font-weight:700; letter-spacing:1.8px;
  text-transform:uppercase; padding:4px 10px; border-radius:99px;
}
.th-id{font-size:10px; color:var(--muted); margin-top:5px; letter-spacing:.5px}

/* ── MAIN GALLERY ───────────────────────── */
.main-gallery{
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-template-rows:220px;
  gap:3px;
  padding:0 36px;
  margin-top:16px;
}
/* cover spans full height left col */
.mg-cover{grid-row:span 2; overflow:hidden; border-radius:var(--r) 0 0 var(--r)}
.mg-cover img,.mg-sec img{width:100%;height:100%;object-fit:cover}
.mg-sec{overflow:hidden}
.mg-sec:first-of-type{border-radius:0 var(--r) 0 0}
.mg-sec:last-of-type{border-radius:0 0 var(--r) 0}
/* When we have right col split into 2 rows */
.main-gallery.has-secondary{grid-template-rows:108px 108px}
/* No cover placeholder */
.mg-placeholder{
  background:linear-gradient(135deg,var(--green) 0%,var(--deep) 100%);
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,.25); font-size:11px; letter-spacing:2px;
  text-transform:uppercase;
}

/* ── METRICS STRIP ──────────────────────── */
.metrics-strip{
  display:flex; flex-wrap:wrap; gap:0;
  margin:14px 36px 0;
  border:1px solid var(--border); border-radius:var(--r);
  overflow:hidden;
}
.metric{
  flex:1; min-width:70px;
  padding:10px 12px;
  border-right:1px solid var(--border);
  text-align:center;
}
.metric:last-child{border-right:none}
.metric-val{font-size:15px; font-weight:700; color:var(--deep); white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.metric-lbl{font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-top:3px}

/* ── CONTENT COLUMNS ────────────────────── */
.content-cols{
  display:grid; grid-template-columns:1.1fr .9fr;
  gap:28px; padding:20px 36px 0;
  flex:1;
}

/* Left: description */
.col-left .section-heading{
  font-size:9px; font-weight:700; letter-spacing:2.5px;
  text-transform:uppercase; color:var(--muted);
  margin-bottom:10px;
}
.description{
  font-size:12.5px; line-height:1.75; color:#2a3230;
}
.description p+p{margin-top:9px}
.lifestyle{
  font-size:12px; line-height:1.65; color:var(--green);
  padding-left:13px; border-left:2.5px solid var(--gold);
  margin-top:12px;
}

/* Right: amenities + highlights */
.col-right .section-heading{
  font-size:9px; font-weight:700; letter-spacing:2.5px;
  text-transform:uppercase; color:var(--muted);
  margin-bottom:10px;
}
.amenities-list{display:flex; flex-wrap:wrap; gap:6px}
.amenity-tag{
  font-size:11px; font-weight:500;
  padding:4px 11px;
  border:1px solid var(--gold); color:var(--green);
  border-radius:99px; background:rgba(201,164,92,.06);
  white-space:nowrap;
}

/* Highlights box */
.highlights-box{
  background:var(--deep); border-radius:var(--r);
  padding:16px 18px; margin-top:16px;
}
.highlights-box .section-heading{color:var(--gold); margin-bottom:10px}
.hl-list{list-style:none; padding:0}
.hl-item{
  display:flex; align-items:flex-start; gap:9px;
  font-size:12px; color:rgba(255,255,255,.88);
  padding:4px 0; line-height:1.5;
}
.hl-dot{
  flex-shrink:0; width:5px; height:5px; border-radius:50%;
  background:var(--gold); margin-top:5px;
}

/* ── ADVISOR FOOTER ─────────────────────── */
.advisor-bar{
  margin-top:auto;
  border-top:2px solid var(--gold);
  background:var(--cream);
  padding:16px 36px;
  display:flex; align-items:center; justify-content:space-between; gap:20px;
}
.adv-name{font-family:var(--serif); font-size:16px; font-weight:600; color:var(--deep); margin-bottom:3px}
.adv-meta{font-size:11px; color:var(--muted); line-height:1.7}
.adv-meta a{color:var(--gold); text-decoration:none}
.adv-cta{font-size:9.5px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:var(--gold); margin-top:6px}
.adv-logo{max-width:80px; max-height:46px; object-fit:contain; flex-shrink:0}

/* ── PAGE FOOTER BAR ────────────────────── */
.page-footer-bar{
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 36px;
  background:var(--deep);
}
.footer-brand{font-size:9px; color:rgba(255,255,255,.4); letter-spacing:1.5px; text-transform:uppercase}
.footer-page{font-size:9px; color:rgba(255,255,255,.4)}

/* ── GALLERY PAGE ───────────────────────── */
.gallery-page{padding:0}
.gallery-page-header{
  display:flex; justify-content:space-between; align-items:baseline;
  padding:20px 36px 14px;
  border-bottom:1px solid var(--border);
}
.gallery-page-title{font-family:var(--serif); font-size:16px; font-weight:600; color:var(--deep)}
.gallery-page-label{font-size:9px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted)}
.gallery-grid{
  display:grid; gap:4px;
  padding:16px 36px;
  flex:1;
}
.gallery-grid.cols-1{grid-template-columns:1fr}
.gallery-grid.cols-2{grid-template-columns:1fr 1fr}
.gallery-item{aspect-ratio:4/3; overflow:hidden; border-radius:var(--r)}
.gallery-item img{width:100%; height:100%; object-fit:cover}
</style>
</head>
<body>

<!-- ════════ PAGE 1 ════════ -->
<div class="page">

  <!-- TOP HEADER -->
  <div class="top-header">
    <div class="th-left">
      <div class="th-title">${esc(title)}</div>
      ${has(location) ? `<div class="th-location">${esc(location)}</div>` : ''}
      ${has(fields.propertyType) ? `<div class="th-type">${esc(fields.propertyType)}</div>` : ''}
    </div>
    <div class="th-right">
      <div class="th-price">${esc(price)}</div>
      <span class="th-op-badge">${esc(opType)}</span>
      ${has(propId) ? `<div class="th-id">${esc(lbl.propertyId)}: ${esc(propId)}</div>` : ''}
    </div>
  </div>

  <!-- MAIN GALLERY -->
  <div class="main-gallery${secondary.length ? ' has-secondary' : ''}">
    <div class="mg-cover">
      ${cover
        ? `<img src="${cover.dataUrl}" alt="${esc(title)}"/>`
        : `<div class="mg-placeholder">photo</div>`}
    </div>
    ${secondary[0]
      ? `<div class="mg-sec"><img src="${secondary[0].dataUrl}" alt=""/></div>`
      : ''}
    ${secondary[1]
      ? `<div class="mg-sec"><img src="${secondary[1].dataUrl}" alt=""/></div>`
      : secondary[0]
        ? `<div class="mg-sec mg-placeholder"></div>`
        : ''}
  </div>

  <!-- METRICS STRIP -->
  ${metrics.length ? `
  <div class="metrics-strip">
    ${metrics.map(m => metricCell(m.label, v(fields[m.key]))).join('')}
  </div>` : ''}

  <!-- CONTENT COLUMNS -->
  <div class="content-cols">

    <!-- LEFT: description -->
    <div class="col-left">
      <div class="section-heading">${lbl.description}</div>
      <div class="description">
        ${descParagraphs.map(p => `<p>${esc(p)}</p>`).join('')}
        ${has(copy.lifestyle) ? `<p class="lifestyle">${esc(copy.lifestyle)}</p>` : ''}
      </div>
    </div>

    <!-- RIGHT: amenities + highlights -->
    <div class="col-right">
      ${copy.amenities?.length ? `
      <div class="section-heading">${lbl.amenities}</div>
      <div class="amenities-list">
        ${copy.amenities.slice(0,16).map(amenityItem).join('')}
      </div>` : ''}

      ${copy.highlights?.length ? `
      <div class="highlights-box">
        <div class="section-heading">${lbl.highlights}</div>
        <ul class="hl-list">
          ${copy.highlights.slice(0,6).map(highlightItem).join('')}
        </ul>
      </div>` : ''}
    </div>

  </div>

  <!-- ADVISOR -->
  <div class="advisor-bar">
    <div>
      <div class="adv-name">${esc(advisor.name || '')}</div>
      <div class="adv-meta">
        ${[advisor.position, advisor.company].filter(has).map(esc).join(' · ')}
        ${has(advisor.phone) ? `<br/>${esc(advisor.phone)}` : ''}
        ${has(advisor.email) ? ` · ${esc(advisor.email)}` : ''}
        ${has(advisor.whatsapp) ? `<br/>WhatsApp ${esc(advisor.whatsapp)}` : ''}
        ${has(advisor.website) ? ` · <a href="${esc(advisor.website)}">${esc(advisor.website.replace(/^https?:\/\//,''))}</a>` : ''}
      </div>
      <div class="adv-cta">${esc(v(copy.cta) || lbl.forSale)}</div>
    </div>
    ${has(advisor.logo) ? `<img class="adv-logo" src="${advisor.logo}" alt="logo"/>` : ''}
  </div>

  <!-- FOOTER BAR -->
  <div class="page-footer-bar">
    <span class="footer-brand">LumiKav Brochure Studio</span>
    <span class="footer-page">${lbl.page} 1</span>
  </div>

</div><!-- end page 1 -->

${galleryPages(extraImgs, lang, title)}

</body>
</html>`;
}
