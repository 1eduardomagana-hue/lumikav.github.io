'use client';

import { ArrowDownToLine, Bot, Check, FileText, GripVertical, ImagePlus, Mail, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { defaultAdvisor, emptyFields, fallbackCopy, fieldLabels } from '@/lib/defaults';
import type { AdvisorInfo, AiExtractionResult, GeneratedPdf, GenerationPayload, Language, MarketingCopy, PropertyFields, TemplateId, UploadedImage } from '@/lib/types';

const fieldKeys = Object.keys(emptyFields) as (keyof PropertyFields)[];
const advisorFields: { key: keyof AdvisorInfo; label: string; type?: string }[] = [
  { key: 'name', label: 'Advisor name' }, { key: 'position', label: 'Position' },
  { key: 'company', label: 'Company' }, { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp' }, { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website' }
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadPdf(pdf: GeneratedPdf) {
  const link = document.createElement('a');
  link.href = `data:${pdf.mimeType};base64,${pdf.base64}`;
  link.download = pdf.filename;
  link.click();
}

function templateLabel(template: TemplateId) {
  return template === 'premium-brochure' ? 'Template A · Premium brochure' : 'Template B · Technical sheet';
}

export default function BrochureStudio() {
  const [rawText, setRawText] = useState('Villa Aurora\nUbicación: Marbella Golden Mile\nPrecio: €2,950,000\n4 habitaciones, 4 baños\nÁrea construida: 420 m²\nTerreno: 980 m²\nParking: 3 plazas\nTerrazas amplias, piscina privada, vistas al mar, cocina de diseño y suite principal con vestidor.');
  const [fields, setFields] = useState<PropertyFields>({ ...emptyFields });
  const [advisor, setAdvisor] = useState<AdvisorInfo>({ ...defaultAdvisor });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [template, setTemplate] = useState<TemplateId>('premium-brochure');
  const [copy, setCopy] = useState<Record<Language, MarketingCopy>>(fallbackCopy);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pdfs, setPdfs] = useState<GeneratedPdf[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [sendHistory, setSendHistory] = useState<string[]>([]);
  const [recipients, setRecipients] = useState('');
  const [emailSelection, setEmailSelection] = useState<'both' | Language>('both');
  const [status, setStatus] = useState('Ready to create premium bilingual PDFs.');
  const [busy, setBusy] = useState(false);

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

  async function extractWithAi() {
    setBusy(true);
    setStatus('Extracting facts and writing bilingual premium copy...');
    try {
      const response = await fetch('/api/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, fields })
      });
      const result = await response.json() as AiExtractionResult & { mode?: string };
      setFields(result.fields);
      setCopy(result.copy);
      setMissingFields(result.missingFields);
      setStatus(`AI extraction complete (${result.mode ?? 'openai'} mode). Review missing fields before generating.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Extraction failed.');
    } finally {
      setBusy(false);
    }
  }

  async function generatePdfs() {
    setBusy(true);
    setStatus('Generating Spanish and English PDFs in one request...');
    try {
      const payload: GenerationPayload = { rawText, fields, advisor, images, template, copy };
      const response = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json() as { pdfs: GeneratedPdf[]; generatedAt: string };
      setPdfs(result.pdfs);
      setHistory((current) => [`${new Date(result.generatedAt).toLocaleString()} · ${templateLabel(template)} · ${fields.title || 'Untitled property'}`, ...current].slice(0, 8));
      setStatus('Both bilingual PDFs are ready to download or email.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'PDF generation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail() {
    const to = recipients.split(/[;,\n]/).map((item) => item.trim()).filter(Boolean);
    if (to.length === 0 || selectedEmailPdfs.length === 0) return;
    setBusy(true);
    setStatus('Sending selected PDFs...');
    try {
      const response = await fetch('/api/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: `${fields.title || 'Property'} brochures`, message: 'Please find attached the requested real estate brochure documents.', pdfs: selectedEmailPdfs })
      });
      const result = await response.json();
      setSendHistory((current) => [`${new Date().toLocaleString()} · ${to.join(', ')} · ${selectedEmailPdfs.length} attachment(s) · ${result.mode}`, ...current].slice(0, 8));
      setStatus(result.mode === 'simulation' ? 'Email simulated. Configure RESEND_API_KEY to send live emails.' : 'Email sent successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Email failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7e8_0,#f7f1e6_36%,#e9dfcf_100%)]">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-estate-deep text-white shadow-premium">
          <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-estate-gold">LumiKav Brochure Studio</p>
              <h1 className="font-serif text-5xl leading-none md:text-7xl">Premium real estate PDFs in Spanish and English.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">Upload raw property notes, complete advisor details, choose a polished template, and generate bilingual marketing brochures or formal technical sheets in one request.</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/80">
                {['AI extraction', 'Editable advisor profile', 'Photo ordering', 'PDF downloads', 'Resend email'].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 px-4 py-2"><Check className="mr-2 inline h-4 w-4 text-estate-gold" />{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
              <p className="field-label !text-estate-gold">Production flow</p>
              <ol className="mt-5 space-y-4 text-sm text-white/80">
                <li>1. Paste raw copy and optionally complete structured fields.</li>
                <li>2. Upload photos, reorder them, and select the hero cover.</li>
                <li>3. Let AI extract missing facts and write bilingual luxury copy.</li>
                <li>4. Generate Spanish and English PDFs together.</li>
                <li>5. Download one, download both, or send selected PDFs by email.</li>
              </ol>
              <div className="mt-6 rounded-2xl bg-estate-gold/15 p-4 text-sm text-estate-cream">{status}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_410px]">
          <div className="space-y-6">
            <section className="premium-card">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="field-label">Property input</p>
                  <h2 className="font-serif text-3xl text-estate-green">Raw notes and structured fields</h2>
                </div>
                <button onClick={extractWithAi} disabled={busy} className="gold-button"><Bot className="h-4 w-4" />AI extract</button>
              </div>
              <textarea className="field-input min-h-44" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste property notes, MLS text, WhatsApp brief, or listing draft..." />
              {missingFields.length > 0 && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><strong>Missing fields:</strong> {missingFields.join(', ')}</div>}
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fieldKeys.map((key) => (
                  <label key={key}><span className="field-label">{fieldLabels[key]}</span><input className="field-input mt-2" value={fields[key]} onChange={(e) => updateField(key, e.target.value)} /></label>
                ))}
              </div>
            </section>

            <section className="premium-card">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="field-label">Images and assets</p>
                  <h2 className="font-serif text-3xl text-estate-green">Upload, reorder, and choose the cover</h2>
                </div>
                <label className="green-button cursor-pointer">
                  <ImagePlus className="h-4 w-4" />Add photos
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImages(e.target.files)} />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <div key={image.id} className="overflow-hidden rounded-3xl border border-estate-green/10 bg-estate-cream">
                    <img src={image.dataUrl} alt={image.name} className="h-40 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-3 text-xs">
                      <button className="ghost-button !px-3 !py-1" onClick={() => chooseCover(image.id)}>{image.role === 'cover' ? 'Cover' : 'Set cover'}</button>
                      <div className="flex gap-1">
                        <button className="ghost-button !px-2 !py-1" onClick={() => moveImage(index, -1)}><GripVertical className="h-3 w-3" />Up</button>
                        <button className="ghost-button !px-2 !py-1" onClick={() => moveImage(index, 1)}>Down</button>
                        <button className="ghost-button !px-2 !py-1" onClick={() => setImages((c) => c.filter((i) => i.id !== image.id))}><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {images.length === 0 && <div className="rounded-3xl border border-dashed border-estate-green/30 p-8 text-sm text-estate-green/70">No photos uploaded yet. The PDF will still generate with a minimal editorial layout.</div>}
              </div>
            </section>

            <section className="premium-card">
              <p className="field-label">Advisor profile</p>
              <h2 className="font-serif text-3xl text-estate-green">Editable dynamic advisor information</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {advisorFields.map(({ key, label, type }) => (
                  <label key={key}><span className="field-label">{label}</span><input type={type ?? 'text'} className="field-input mt-2" value={advisor[key] ?? ''} onChange={(e) => updateAdvisor(key, e.target.value)} /></label>
                ))}
                <label><span className="field-label">Logo</span><input type="file" accept="image/*" className="field-input mt-2" onChange={(e) => handleLogo(e.target.files?.[0])} /></label>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="premium-card sticky top-6">
              <p className="field-label">Preview and generation</p>
              <h2 className="font-serif text-3xl text-estate-green">{copy.es.headline}</h2>
              <p className="mt-3 text-sm leading-6 text-estate-charcoal/70">{copy.en.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => setTemplate('premium-brochure')} className={template === 'premium-brochure' ? 'green-button' : 'ghost-button'}><Sparkles className="h-4 w-4" />Template A</button>
                <button onClick={() => setTemplate('technical-sheet')} className={template === 'technical-sheet' ? 'green-button' : 'ghost-button'}><FileText className="h-4 w-4" />Template B</button>
              </div>
              <button onClick={generatePdfs} disabled={busy} className="gold-button mt-5 w-full"><FileText className="h-4 w-4" />Generate ES + EN PDFs</button>
              {pdfs.length > 0 && (
                <div className="mt-5 space-y-3">
                  {pdfs.map((pdf) => <button key={pdf.language} onClick={() => downloadPdf(pdf)} className="ghost-button w-full"><ArrowDownToLine className="h-4 w-4" />Download {pdf.language === 'es' ? 'Spanish' : 'English'} PDF</button>)}
                  <button onClick={() => pdfs.forEach(downloadPdf)} className="green-button w-full"><ArrowDownToLine className="h-4 w-4" />Download both</button>
                </div>
              )}
            </section>

            <section className="premium-card">
              <p className="field-label">Email delivery</p>
              <h2 className="font-serif text-2xl text-estate-green">Send PDFs</h2>
              <textarea className="field-input mt-3 min-h-24" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="client@example.com, team@example.com" />
              <select className="field-input mt-3" value={emailSelection} onChange={(e) => setEmailSelection(e.target.value as 'both' | Language)}>
                <option value="both">Send both PDFs</option>
                <option value="es">Spanish only</option>
                <option value="en">English only</option>
              </select>
              <button onClick={sendEmail} disabled={busy || pdfs.length === 0} className="green-button mt-3 w-full"><Mail className="h-4 w-4" />Send selected</button>
            </section>

            <section className="premium-card">
              <p className="field-label">History</p>
              <h2 className="font-serif text-2xl text-estate-green">Generation and send log</h2>
              <div className="mt-4 space-y-2 text-sm text-estate-charcoal/70">
                {[...history, ...sendHistory].length === 0 ? 'No history yet.' : [...history, ...sendHistory].map((item) => <p key={item} className="rounded-2xl bg-estate-cream p-3">{item}</p>)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
