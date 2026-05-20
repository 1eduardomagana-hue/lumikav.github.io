'use client';

import { ArrowDownToLine, Bot, Check, FileText, GripVertical, ImagePlus, Mail, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { defaultAdvisor, emptyFields, fallbackCopy, fieldLabels } from '@/lib/defaults';
import type { AdvisorInfo, AiExtractionResult, GeneratedPdf, GenerationPayload, Language, MarketingCopy, PropertyFields, TemplateId, UploadedImage } from '@/lib/types';

// ── UI language (interface) vs PDF language (output) ──────────────────────────
type UILang = 'es' | 'en';

const t: Record<UILang, Record<string, string>> = {
  es: {
    eyebrow: 'LumiKav Brochure Studio',
    hero_title: 'PDFs inmobiliarios premium en español e inglés.',
    hero_desc: 'Sube notas de la propiedad, completa los datos del asesor, elige una plantilla y genera folletos bilingües en una sola solicitud.',
    flow_label: 'Flujo de producción',
    flow_1: '1. Pega el texto de la propiedad y completa los campos.',
    flow_2: '2. Sube fotos, reordénalas y elige la portada.',
    flow_3: '3. Deja que la IA extraiga datos y escriba el copy bilingüe.',
    flow_4: '4. Genera los PDFs en español e inglés juntos.',
    flow_5: '5. Descarga uno, los dos, o envíalos por email.',
    feat_ai: 'Extracción con IA',
    feat_advisor: 'Perfil de asesor editable',
    feat_photos: 'Ordenar fotos',
    feat_pdf: 'Descarga PDFs',
    feat_email: 'Envío por email',
    prop_label: 'Datos de la propiedad',
    prop_title: 'Notas y campos estructurados',
    prop_placeholder: 'Escribe o pega aquí cualquier información de la propiedad.\n\nEjemplos de lo que puedes incluir:\n· Nombre o proyecto (ej. "Residencia Las Palmas")\n· Tipo de propiedad (casa, departamento, local...)\n· Ubicación o colonia\n· Precio y tipo de operación (venta / renta)\n· Superficie construida y/o terreno\n· Número de recámaras, baños, estacionamientos\n· Amenidades o características especiales\n· Cualquier texto del desarrollador, MLS o WhatsApp\n\nLa IA extraerá los datos clave y generará el copy automáticamente.',
    ai_btn: 'Extraer con IA',
    missing: 'Campos faltantes:',
    images_label: 'Imágenes y assets',
    images_title: 'Sube, reordena y elige la portada',
    add_photos: 'Agregar fotos',
    set_cover: 'Portada',
    cover_btn: 'Poner como portada',
    up: 'Arriba',
    down: 'Abajo',
    no_photos: 'Sin fotos aún. El PDF se generará con un layout editorial mínimo.',
    advisor_label: 'Perfil del asesor',
    advisor_title: 'Información dinámica del asesor',
    logo: 'Logo',
    preview_label: 'Vista previa y generación',
    tpl_a: 'Plantilla A',
    tpl_b: 'Plantilla B',
    generate_btn: 'Generar flyer + PDFs',
    dl_es: 'Descargar PDF Español',
    dl_en: 'Descargar PDF Inglés',
    dl_both: 'Descargar ambos PDFs',
    dl_html_es: 'Flyer HTML (ES)',
    dl_html_en: 'Flyer HTML (EN)',
    analyze_btn: 'Analizar fotos con IA',
    analyzing: 'Analizando fotos…',
    analyze_done: 'Análisis completo — captions aplicados.',
    analyze_none: 'Sube fotos primero para analizar.',
    analyze_no_key: 'Sin API key de OpenAI — actívala en variables de entorno.',
    email_label: 'Envío por email',
    email_title: 'Enviar PDFs',
    email_placeholder: 'cliente@ejemplo.com, equipo@ejemplo.com',
    send_both: 'Enviar ambos PDFs',
    send_es: 'Solo español',
    send_en: 'Solo inglés',
    send_btn: 'Enviar seleccionados',
    history_label: 'Historial',
    history_title: 'Registro de generaciones y envíos',
    no_history: 'Sin historial aún.',
    adv_name: 'Nombre del asesor',
    adv_pos: 'Cargo',
    adv_company: 'Empresa',
    adv_phone: 'Teléfono',
    adv_wa: 'WhatsApp',
    adv_email: 'Email',
    adv_web: 'Sitio web',
    status_ready: 'Listo para crear PDFs bilingües premium.',
    status_extracting: 'Extrayendo datos y escribiendo copy bilingüe...',
    status_extracted: 'Extracción completa',
    status_missing: 'Revisa los campos faltantes antes de generar.',
    status_generating: 'Generando flyers y PDFs bilingües...',
    status_generated: 'Flyers y PDFs listos. Descarga el HTML para compartir como imagen.',
    status_sending: 'Enviando PDFs seleccionados...',
    status_simulated: 'Email simulado. Configura RESEND_API_KEY para envíos reales.',
    status_sent: 'Email enviado correctamente.',
    status_error: 'Error',
  },
  en: {
    eyebrow: 'LumiKav Brochure Studio',
    hero_title: 'Premium real estate PDFs in Spanish and English.',
    hero_desc: 'Upload raw property notes, complete advisor details, choose a polished template, and generate bilingual marketing brochures in one request.',
    flow_label: 'Production flow',
    flow_1: '1. Paste raw copy and optionally complete structured fields.',
    flow_2: '2. Upload photos, reorder them, and select the hero cover.',
    flow_3: '3. Let AI extract missing facts and write bilingual luxury copy.',
    flow_4: '4. Generate Spanish and English PDFs together.',
    flow_5: '5. Download one, download both, or send selected PDFs by email.',
    feat_ai: 'AI extraction',
    feat_advisor: 'Editable advisor profile',
    feat_photos: 'Photo ordering',
    feat_pdf: 'PDF downloads',
    feat_email: 'Resend email',
    prop_label: 'Property input',
    prop_title: 'Raw notes and structured fields',
    prop_placeholder: 'Type or paste any property information here.\n\nExamples of what to include:\n· Property name or project\n· Property type (house, apartment, office...)\n· Location or neighborhood\n· Price and operation type (sale / rent)\n· Built area and/or lot size\n· Bedrooms, bathrooms, parking spaces\n· Amenities or special features\n· Any developer text, MLS listing, or WhatsApp notes\n\nAI will extract the key data and write the copy automatically.',
    ai_btn: 'AI extract',
    missing: 'Missing fields:',
    images_label: 'Images and assets',
    images_title: 'Upload, reorder, and choose the cover',
    add_photos: 'Add photos',
    set_cover: 'Cover',
    cover_btn: 'Set cover',
    up: 'Up',
    down: 'Down',
    no_photos: 'No photos uploaded yet. The PDF will still generate with a minimal editorial layout.',
    advisor_label: 'Advisor profile',
    advisor_title: 'Editable dynamic advisor information',
    logo: 'Logo',
    preview_label: 'Preview and generation',
    tpl_a: 'Template A',
    tpl_b: 'Template B',
    generate_btn: 'Generate flyer + PDFs',
    dl_es: 'Download Spanish PDF',
    dl_en: 'Download English PDF',
    dl_both: 'Download both PDFs',
    dl_html_es: 'HTML Flyer (ES)',
    dl_html_en: 'HTML Flyer (EN)',
    analyze_btn: 'Analyze photos with AI',
    analyzing: 'Analyzing photos…',
    analyze_done: 'Analysis complete — captions applied.',
    analyze_none: 'Upload photos first.',
    analyze_no_key: 'No OpenAI API key configured.',
    email_label: 'Email delivery',
    email_title: 'Send PDFs',
    email_placeholder: 'client@example.com, team@example.com',
    send_both: 'Send both PDFs',
    send_es: 'Spanish only',
    send_en: 'English only',
    send_btn: 'Send selected',
    history_label: 'History',
    history_title: 'Generation and send log',
    no_history: 'No history yet.',
    adv_name: 'Advisor name',
    adv_pos: 'Position',
    adv_company: 'Company',
    adv_phone: 'Phone',
    adv_wa: 'WhatsApp',
    adv_email: 'Email',
    adv_web: 'Website',
    status_ready: 'Ready to create premium bilingual PDFs.',
    status_extracting: 'Extracting facts and writing bilingual premium copy...',
    status_extracted: 'Extraction complete',
    status_missing: 'Review missing fields before generating.',
    status_generating: 'Generating bilingual flyers and PDFs...',
    status_generated: 'Flyers and PDFs ready. Download HTML to share as image.',
    status_sending: 'Sending selected PDFs...',
    status_simulated: 'Email simulated. Configure RESEND_API_KEY to send live emails.',
    status_sent: 'Email sent successfully.',
    status_error: 'Error',
  }
};

const fieldKeys = Object.keys(emptyFields) as (keyof PropertyFields)[];

// Compress image to max 900px wide/tall, JPEG quality 0.72 — keeps payload under Vercel's 4.5MB limit
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function downloadPdf(pdf: GeneratedPdf) {
  const link = document.createElement('a');
  link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
  link.download = pdf.filename;
  link.click();
}

function downloadHtml(item: { filename: string; base64: string }) {
  const link = document.createElement('a');
  link.href = `data:text/html;base64,${item.base64}`;
  link.download = item.filename;
  link.click();
}

function templateLabel(template: TemplateId, lang: UILang) {
  return template === 'premium-brochure'
    ? lang === 'es' ? 'Plantilla A · Brochure premium' : 'Template A · Premium brochure'
    : lang === 'es' ? 'Plantilla B · Ficha técnica' : 'Template B · Technical sheet';
}

function LangToggle({ lang, setLang }: { lang: UILang; setLang: (l: UILang) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur">
      <button
        onClick={() => setLang('es')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${lang === 'es' ? 'bg-white text-estate-deep shadow-sm' : 'text-white/70 hover:text-white'}`}
      >
        <span className="text-base leading-none">🇲🇽</span> ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${lang === 'en' ? 'bg-white text-estate-deep shadow-sm' : 'text-white/70 hover:text-white'}`}
      >
        <span className="text-base leading-none">🇺🇸</span> EN
      </button>
    </div>
  );
}

export default function BrochureStudio() {
  const [uiLang, setUiLang] = useState<UILang>('es');
  const i = t[uiLang];

  const advisorFields: { key: keyof AdvisorInfo; label: string; type?: string }[] = [
    { key: 'name', label: i.adv_name }, { key: 'position', label: i.adv_pos },
    { key: 'company', label: i.adv_company }, { key: 'phone', label: i.adv_phone },
    { key: 'whatsapp', label: i.adv_wa }, { key: 'email', label: i.adv_email, type: 'email' },
    { key: 'website', label: i.adv_web }
  ];

  const [rawText, setRawText] = useState('');
  const [fields, setFields] = useState<PropertyFields>({ ...emptyFields });
  const [advisor, setAdvisor] = useState<AdvisorInfo>({ ...defaultAdvisor });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [template, setTemplate] = useState<TemplateId>('premium-brochure');
  const [copy, setCopy] = useState<Record<Language, MarketingCopy>>(fallbackCopy);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pdfs, setPdfs] = useState<GeneratedPdf[]>([]);
  const [htmlFlyers, setHtmlFlyers] = useState<Record<string, { filename: string; base64: string }>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [sendHistory, setSendHistory] = useState<string[]>([]);
  const [recipients, setRecipients] = useState('');
  const [emailSelection, setEmailSelection] = useState<'both' | Language>('both');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const currentStatus = status || i.status_ready;

  const selectedEmailPdfs = useMemo(() => {
    if (emailSelection === 'both') return pdfs;
    return pdfs.filter((pdf) => pdf.language === emailSelection);
  }, [emailSelection, pdfs]);

  async function handleImages(files: FileList | null) {
    if (!files) return;
    const next = await Promise.all(Array.from(files).map(async (file, index) => ({
      id: crypto.randomUUID(), name: file.name, dataUrl: await fileToDataUrl(file),
      role: images.length === 0 && index === 0 ? 'cover' as const : 'gallery' as const
    })));
    setImages((current) => [...current, ...next]);
  }

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    const logo = await fileToDataUrl(file);
    setAdvisor((current) => ({ ...current, logo }));
  }

  function updateField(key: keyof PropertyFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function updateAdvisor(key: keyof AdvisorInfo, value: string) {
    setAdvisor((current) => ({ ...current, [key]: value }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function chooseCover(id: string) {
    setImages((current) => current.map((image) => ({ ...image, role: image.id === id ? 'cover' as const : 'gallery' as const })));
  }

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function deleteSelected() {
    setImages((current) => current.filter((img) => !selectedIds.has(img.id)));
    setSelectedIds(new Set());
  }

  async function extractWithAi() {
    setBusy(true);
    setStatus(i.status_extracting);
    try {
      const response = await fetch('/api/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, fields })
      });
      const result = await response.json() as AiExtractionResult & { mode?: string };
      setFields(result.fields);
      setCopy(result.copy);
      setMissingFields(result.missingFields);
      setStatus(`${i.status_extracted} (${result.mode ?? 'openai'}). ${i.status_missing}`);
    } catch (error) {
      setStatus(`${i.status_error}: ${error instanceof Error ? error.message : ''}`);
    } finally {
      setBusy(false);
    }
  }

  async function analyzeImages() {
    if (!images.length) { setStatus(i.analyze_none); return; }
    setBusy(true);
    setStatus(i.analyzing);
    try {
      const payload = images.map(img => ({ id: img.id, dataUrl: img.dataUrl }));
      const response = await fetch('/api/analyze-images', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: payload })
      });
      const result = await response.json() as { analyses: import('@/lib/types').ImageAnalysis[]; mode: string };
      if (result.mode === 'no_key') { setStatus(i.analyze_no_key); return; }
      setImages(current => current.map(img => {
        const analysis = result.analyses.find(a => a.imageId === img.id);
        return analysis ? { ...img, analysis } : img;
      }));
      setStatus(i.analyze_done);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'analysis failed'}`);
    } finally {
      setBusy(false);
    }
  }

  async function generatePdfs() {
    setBusy(true);
    setStatus(i.status_generating);
    try {
      const payload: GenerationPayload = { rawText, fields, advisor, images, template, copy };
      const response = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json() as { pdfs: GeneratedPdf[]; html: Record<string, { filename: string; base64: string }>; generatedAt: string };
      setPdfs(result.pdfs);
      setHtmlFlyers(result.html ?? {});
      setHistory((current) => [`${new Date(result.generatedAt).toLocaleString()} · ${templateLabel(template, uiLang)} · ${fields.title || (uiLang === 'es' ? 'Propiedad sin título' : 'Untitled property')}`, ...current].slice(0, 8));
      setStatus(i.status_generated);
    } catch (error) {
      setStatus(`${i.status_error}: ${error instanceof Error ? error.message : ''}`);
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail() {
    const to = recipients.split(/[;,\n]/).map((item) => item.trim()).filter(Boolean);
    if (to.length === 0 || selectedEmailPdfs.length === 0) return;
    setBusy(true);
    setStatus(i.status_sending);
    try {
      const response = await fetch('/api/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: `${fields.title || 'Property'} brochures`, message: 'Please find attached the requested real estate brochure documents.', pdfs: selectedEmailPdfs })
      });
      const result = await response.json();
      setSendHistory((current) => [`${new Date().toLocaleString()} · ${to.join(', ')} · ${selectedEmailPdfs.length} PDF(s) · ${result.mode}`, ...current].slice(0, 8));
      setStatus(result.mode === 'simulation' ? i.status_simulated : i.status_sent);
    } catch (error) {
      setStatus(`${i.status_error}: ${error instanceof Error ? error.message : ''}`);
    } finally {
      setBusy(false);
    }
  }

  const fieldLabelsI18n: Record<keyof PropertyFields, string> = uiLang === 'es' ? {
    title: 'Nombre', propertyType: 'Tipo', location: 'Ubicación', price: 'Precio',
    operationType: 'Operación', bedrooms: 'Recámaras', bathrooms: 'Baños',
    halfBaths: 'Medios baños', builtArea: 'Construcción', lotArea: 'Terreno',
    parking: 'Estacionamientos', maintenance: 'Mantenimiento',
    yearBuilt: 'Año', status: 'Estado', propertyId: 'ID interno'
  } : fieldLabels;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7e8_0,#f7f1e6_36%,#e9dfcf_100%)]">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* HERO */}
        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-estate-deep text-white shadow-premium">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-estate-gold">{i.eyebrow}</p>
                <LangToggle lang={uiLang} setLang={setUiLang} />
              </div>
              <h1 className="font-serif text-5xl leading-none md:text-7xl">{i.hero_title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{i.hero_desc}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/80">
                {[i.feat_ai, i.feat_advisor, i.feat_photos, i.feat_pdf, i.feat_email].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 px-4 py-2">
                    <Check className="mr-2 inline h-4 w-4 text-estate-gold" />{item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="field-label !text-estate-gold">{i.flow_label}</p>
              <ol className="mt-5 space-y-4 text-sm text-white/80">
                {[i.flow_1, i.flow_2, i.flow_3, i.flow_4, i.flow_5].map((step) => <li key={step}>{step}</li>)}
              </ol>
              <div className="mt-6 rounded-2xl bg-estate-gold/15 p-4 text-sm text-estate-cream">{currentStatus}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_410px]">
          <div className="space-y-6">
            {/* PROPERTY INPUT */}
            <section className="premium-card">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="field-label">{i.prop_label}</p>
                  <h2 className="font-serif text-3xl text-estate-green">{i.prop_title}</h2>
                </div>
                <button onClick={extractWithAi} disabled={busy} className="gold-button">
                  <Bot className="h-4 w-4" />{i.ai_btn}
                </button>
              </div>
              <textarea className="field-input min-h-44" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder={i.prop_placeholder} />
              {missingFields.length > 0 && (
                <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                  <strong>{i.missing}</strong> {missingFields.join(', ')}
                </div>
              )}
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fieldKeys.map((key) => (
                  <label key={key}>
                    <span className="field-label">{fieldLabelsI18n[key]}</span>
                    <input className="field-input mt-2" value={fields[key]} onChange={(e) => updateField(key, e.target.value)} />
                  </label>
                ))}
              </div>
            </section>

            {/* IMAGES */}
            <section className="premium-card">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="field-label">{i.images_label}</p>
                  <h2 className="font-serif text-3xl text-estate-green">{i.images_title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <button onClick={deleteSelected} className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                      {uiLang === 'es' ? `Eliminar (${selectedIds.size})` : `Delete (${selectedIds.size})`}
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    {images.length > 0 && (
                      <button onClick={analyzeImages} disabled={busy} className="ghost-button">
                        <Wand2 className="h-4 w-4" />{i.analyze_btn}
                      </button>
                    )}
                    <label className="green-button cursor-pointer">
                      <ImagePlus className="h-4 w-4" />{i.add_photos}
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImages(e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => {
                  const isSelected = selectedIds.has(image.id);
                  return (
                    <div key={image.id} className={`overflow-hidden rounded-3xl border-2 bg-estate-cream transition ${isSelected ? 'border-red-400 shadow-md' : 'border-estate-green/10'}`}>
                      {/* Image with checkbox overlay */}
                      <div className="relative">
                        <img src={image.dataUrl} alt={image.name} className="h-40 w-full object-cover" />
                        {/* Checkbox top-left */}
                        <button
                          onClick={() => toggleSelect(image.id)}
                          className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${isSelected ? 'border-red-400 bg-red-400 text-white' : 'border-white/70 bg-black/30 text-white hover:bg-black/50'}`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </button>
                        {/* Cover badge */}
                        {image.role === 'cover' && (
                          <span className="absolute right-2 top-2 rounded-full bg-estate-gold px-2 py-0.5 text-[10px] font-bold text-estate-deep">
                            {uiLang === 'es' ? 'PORTADA' : 'COVER'}
                          </span>
                        )}
                        {/* Analysis badge */}
                        {image.analysis && (
                          <span className="absolute left-2 bottom-2 rounded-full bg-estate-deep/80 px-2 py-0.5 text-[9px] text-estate-gold font-semibold backdrop-blur">
                            {image.analysis.detectedArea}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 p-3 text-xs">
                        <button className="ghost-button !px-3 !py-1" onClick={() => chooseCover(image.id)}>
                          {image.role === 'cover' ? i.set_cover : i.cover_btn}
                        </button>
                        <div className="flex gap-1">
                          <button className="ghost-button !px-2 !py-1" onClick={() => moveImage(index, -1)}><GripVertical className="h-3 w-3" />{i.up}</button>
                          <button className="ghost-button !px-2 !py-1" onClick={() => moveImage(index, 1)}>{i.down}</button>
                          <button className="ghost-button !px-2 !py-1 text-red-500 hover:border-red-300" onClick={() => { setImages((c) => c.filter((img) => img.id !== image.id)); setSelectedIds((s) => { const n = new Set(s); n.delete(image.id); return n; }); }}><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {images.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-estate-green/30 p-8 text-sm text-estate-green/70">{i.no_photos}</div>
                )}
              </div>
            </section>

            {/* ADVISOR */}
            <section className="premium-card">
              <p className="field-label">{i.advisor_label}</p>
              <h2 className="font-serif text-3xl text-estate-green">{i.advisor_title}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {advisorFields.map(({ key, label, type }) => (
                  <label key={key}>
                    <span className="field-label">{label}</span>
                    <input type={type ?? 'text'} className="field-input mt-2" value={advisor[key] ?? ''} onChange={(e) => updateAdvisor(key, e.target.value)} />
                  </label>
                ))}
                <label><span className="field-label">{i.logo}</span><input type="file" accept="image/*" className="field-input mt-2" onChange={(e) => handleLogo(e.target.files?.[0])} /></label>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {/* GENERATION */}
            <section className="premium-card sticky top-6">
              <p className="field-label">{i.preview_label}</p>
              <h2 className="font-serif text-3xl text-estate-green">{copy.es.headline}</h2>
              <p className="mt-3 text-sm leading-6 text-estate-charcoal/70">{copy.en.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setTemplate('premium-brochure')} className={template === 'premium-brochure' ? 'green-button' : 'ghost-button'}>
                  <Sparkles className="h-4 w-4" />{i.tpl_a}
                </button>
                <button onClick={() => setTemplate('technical-sheet')} className={template === 'technical-sheet' ? 'green-button' : 'ghost-button'}>
                  <FileText className="h-4 w-4" />{i.tpl_b}
                </button>
              </div>
              <button onClick={generatePdfs} disabled={busy} className="gold-button mt-5 w-full">
                <FileText className="h-4 w-4" />{i.generate_btn}
              </button>
              {pdfs.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="field-label mt-1">PDFs</p>
                  {pdfs.map((pdf) => (
                    <button key={pdf.language} onClick={() => downloadPdf(pdf)} className="ghost-button w-full">
                      <ArrowDownToLine className="h-4 w-4" />
                      {pdf.language === 'es' ? i.dl_es : i.dl_en}
                    </button>
                  ))}
                  <button onClick={() => pdfs.forEach(downloadPdf)} className="green-button w-full">
                    <ArrowDownToLine className="h-4 w-4" />{i.dl_both}
                  </button>
                  {Object.keys(htmlFlyers).length > 0 && (
                    <>
                      <p className="field-label mt-3">{uiLang === 'es' ? 'Flyer HTML (para screenshot/WhatsApp)' : 'HTML Flyer (for screenshot/WhatsApp)'}</p>
                      {htmlFlyers['es'] && (
                        <button onClick={() => downloadHtml(htmlFlyers['es'])} className="ghost-button w-full text-estate-gold border-estate-gold/40 hover:border-estate-gold">
                          <FileText className="h-4 w-4" />{i.dl_html_es}
                        </button>
                      )}
                      {htmlFlyers['en'] && (
                        <button onClick={() => downloadHtml(htmlFlyers['en'])} className="ghost-button w-full text-estate-gold border-estate-gold/40 hover:border-estate-gold">
                          <FileText className="h-4 w-4" />{i.dl_html_en}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            {/* EMAIL */}
            <section className="premium-card">
              <p className="field-label">{i.email_label}</p>
              <h2 className="font-serif text-2xl text-estate-green">{i.email_title}</h2>
              <textarea className="field-input mt-3 min-h-24" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={i.email_placeholder} />
              <select className="field-input mt-3" value={emailSelection} onChange={(e) => setEmailSelection(e.target.value as 'both' | Language)}>
                <option value="both">{i.send_both}</option>
                <option value="es">{i.send_es}</option>
                <option value="en">{i.send_en}</option>
              </select>
              <button onClick={sendEmail} disabled={busy || pdfs.length === 0} className="green-button mt-3 w-full">
                <Mail className="h-4 w-4" />{i.send_btn}
              </button>
            </section>

            {/* HISTORY */}
            <section className="premium-card">
              <p className="field-label">{i.history_label}</p>
              <h2 className="font-serif text-2xl text-estate-green">{i.history_title}</h2>
              <div className="mt-4 space-y-2 text-sm text-estate-charcoal/70">
                {[...history, ...sendHistory].length === 0
                  ? i.no_history
                  : [...history, ...sendHistory].map((item) => <p key={item} className="rounded-2xl bg-estate-cream p-3">{item}</p>)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
