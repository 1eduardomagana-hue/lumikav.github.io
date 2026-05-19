import React from 'react';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fallbackCopy } from '@/lib/defaults';
import { buildFlyerHtml } from '@/lib/flyer-template';
import { PropertySheet } from '@/lib/pdf-sheet';
import type { GeneratedPdf, GenerationPayload, Language } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  rawText: z.string().optional(),
  fields: z.object({}).passthrough(),
  advisor: z.object({}).passthrough(),
  images: z.array(z.object({}).passthrough()).default([]),
  template: z.enum(['premium-brochure', 'technical-sheet']).default('premium-brochure'),
  copy: z.record(z.any()).nullable().optional(),
});

function safeName(value: string) {
  return (value || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

export async function POST(request: Request) {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const raw = schema.parse(await request.json()) as unknown as GenerationPayload;
  const copy = (raw.copy ?? fallbackCopy) as Record<Language, typeof fallbackCopy['es']>;
  const languages: Language[] = ['es', 'en'];
  const name = safeName(raw.fields.title as string);

  // Build HTMLs for download
  const htmls: Record<Language, string> = {
    es: buildFlyerHtml({ lang: 'es', fields: raw.fields, copy: copy['es'] ?? fallbackCopy['es'], advisor: raw.advisor, images: raw.images }),
    en: buildFlyerHtml({ lang: 'en', fields: raw.fields, copy: copy['en'] ?? fallbackCopy['en'], advisor: raw.advisor, images: raw.images }),
  };

  // Generate PDFs with react-pdf
  const pdfs: GeneratedPdf[] = await Promise.all(languages.map(async (language) => {
    const doc = React.createElement(PropertySheet, {
      lang: language,
      fields: raw.fields,
      copy: copy[language] ?? fallbackCopy[language],
      advisor: raw.advisor,
      images: raw.images,
    });
    const buffer = await renderToBuffer(doc as any);
    return {
      language,
      filename: `${name}-ficha-${language}.pdf`,
      base64: Buffer.from(buffer).toString('base64'),
      mimeType: 'application/pdf' as const,
    };
  }));

  return NextResponse.json({
    pdfs,
    html: {
      es: { filename: `${name}-ficha-es.html`, base64: Buffer.from(htmls.es).toString('base64') },
      en: { filename: `${name}-ficha-en.html`, base64: Buffer.from(htmls.en).toString('base64') },
    },
    generatedAt: new Date().toISOString(),
  });
}
