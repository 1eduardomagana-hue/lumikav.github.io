'use client';

import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { buildClipboardContent, buildMailtoUrl, buildWhatsAppUrl, type ShareData } from '@/lib/share';

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  es: {
    title: 'Compartir propuesta',
    subtitle: 'Sin costo — sin configuración de API',
    copy: 'Copiar email',
    copied: '¡Copiado!',
    gmail: 'Abrir correo',
    whatsapp: 'WhatsApp',
    send: 'Enviar por email',
    sending: 'Enviando…',
    sent: '¡Enviado!',
    sendFail: 'No se pudo enviar. Usa la opción manual.',
    manualMode: 'Modo manual activo',
    manualDesc: 'La propuesta se prepara para copiar o abrir en tu cliente de correo.',
    autoMode: 'Envío automático disponible',
    clientEmail: 'Email del cliente (opcional)',
    clientPhone: 'WhatsApp del cliente (opcional)',
    clientName: 'Nombre del cliente (opcional)',
    proposalUrl: 'URL de la ficha (opcional)',
    noContent: 'Genera los PDFs primero para habilitar compartir.',
    fieldLabel: 'Datos para compartir',
  },
  en: {
    title: 'Share proposal',
    subtitle: 'No cost — no API setup required',
    copy: 'Copy email',
    copied: 'Copied!',
    gmail: 'Open mail client',
    whatsapp: 'WhatsApp',
    send: 'Send email',
    sending: 'Sending…',
    sent: 'Sent!',
    sendFail: 'Could not send. Use the manual option.',
    manualMode: 'Manual mode active',
    manualDesc: 'The proposal is ready to copy or open in your mail client.',
    autoMode: 'Automatic sending available',
    clientEmail: 'Client email (optional)',
    clientPhone: 'Client WhatsApp (optional)',
    clientName: 'Client name (optional)',
    proposalUrl: 'Proposal URL (optional)',
    noContent: 'Generate PDFs first to enable sharing.',
    fieldLabel: 'Share details',
  }
};

interface Props {
  data: Omit<ShareData, 'clientName' | 'clientEmail' | 'clientPhone' | 'proposalUrl'>;
  hasResendKey: boolean; // passed from server via prop or env check
  lang: 'es' | 'en';
  disabled?: boolean;
  /** Optional: PDF base64 for email attachment when using Resend */
  pdfBase64?: string;
  pdfFilename?: string;
}

export default function SharePanel({ data, hasResendKey, lang, disabled, pdfBase64, pdfFilename }: Props) {
  const i = T[lang];

  const [clientName,  setClientName]  = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [proposalUrl, setProposalUrl] = useState('');
  const [copied,      setCopied]      = useState(false);
  const [sendState,   setSendState]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [expanded,    setExpanded]    = useState(false);

  const shareData: ShareData = {
    ...data,
    lang,
    clientName:  clientName  || undefined,
    clientEmail: clientEmail || undefined,
    clientPhone: clientPhone || undefined,
    proposalUrl: proposalUrl || undefined,
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  function handleCopy() {
    const text = buildClipboardContent(shareData);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleOpenMail() {
    window.location.href = buildMailtoUrl(shareData);
  }

  function handleWhatsApp() {
    window.open(buildWhatsAppUrl(shareData), '_blank', 'noopener,noreferrer');
  }

  async function handleSend() {
    if (!clientEmail) { handleOpenMail(); return; }
    setSendState('sending');
    try {
      const pdfs = pdfBase64 && pdfFilename
        ? [{ filename: pdfFilename, base64: pdfBase64, mimeType: 'application/pdf' }]
        : [];
      const { buildEmailSubject, buildEmailBody } = await import('@/lib/share');
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [clientEmail],
          subject: buildEmailSubject(shareData),
          message: buildEmailBody(shareData),
          pdfs,
        }),
      });
      const result = await res.json();
      setSendState(result.mode === 'simulation' || result.mode === 'resend' ? 'sent' : 'error');
    } catch {
      setSendState('error');
    }
    setTimeout(() => setSendState('idle'), 4000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (disabled) {
    return (
      <section className="premium-card opacity-60">
        <p className="field-label">{i.title}</p>
        <p className="mt-2 text-sm text-estate-muted">{i.noContent}</p>
      </section>
    );
  }

  const inputCls = 'w-full rounded-xl border border-estate-green/15 bg-white/80 px-3 py-2 text-sm text-estate-charcoal transition focus:border-estate-gold focus:outline-none focus:ring-1 focus:ring-estate-gold/30';

  return (
    <section className="premium-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="field-label">{i.title}</p>
          <p className="mt-0.5 text-xs text-estate-charcoal/60">{i.subtitle}</p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="ghost-button !px-3 !py-1.5 text-xs"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Mode badge */}
      <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${hasResendKey ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
        <span>{hasResendKey ? '🟢' : '🟡'}</span>
        <span>{hasResendKey ? i.autoMode : i.manualMode} — {i.manualDesc}</span>
      </div>

      {/* Optional client fields */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-estate-green/10 pt-4">
          <p className="field-label">{i.fieldLabel}</p>
          <label>
            <span className="mb-1 block text-xs text-estate-charcoal/60">{i.clientName}</span>
            <input className={inputCls} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej. Carlos Rodríguez" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-estate-charcoal/60">{i.clientEmail}</span>
            <input className={inputCls} type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="cliente@correo.com" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-estate-charcoal/60">{i.clientPhone}</span>
            <input className={inputCls} value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+52 999 000 0000" />
          </label>
          <label>
            <span className="mb-1 block text-xs text-estate-charcoal/60">{i.proposalUrl}</span>
            <input className={inputCls} value={proposalUrl} onChange={e => setProposalUrl(e.target.value)} placeholder="https://..." />
          </label>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* Copy */}
        <button onClick={handleCopy} className="ghost-button w-full">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? i.copied : i.copy}
        </button>

        {/* Open mail */}
        <button onClick={handleOpenMail} className="ghost-button w-full">
          <Mail className="h-4 w-4" />
          {i.gmail}
        </button>

        {/* WhatsApp */}
        <button onClick={handleWhatsApp} className="green-button w-full col-span-2">
          <MessageCircle className="h-4 w-4" />
          {i.whatsapp}
        </button>

        {/* Send via Resend (visible always — falls back gracefully) */}
        <button
          onClick={handleSend}
          disabled={sendState === 'sending'}
          className={`gold-button w-full col-span-2 ${sendState === 'sent' ? '!bg-green-600' : sendState === 'error' ? '!bg-red-500' : ''}`}
        >
          {sendState === 'sending' ? <span className="animate-spin">⏳</span> : sendState === 'sent' ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {sendState === 'sending' ? i.sending : sendState === 'sent' ? i.sent : sendState === 'error' ? i.sendFail : i.send}
        </button>
      </div>
    </section>
  );
}
