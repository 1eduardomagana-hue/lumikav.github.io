import React from 'react';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fallbackCopy } from '@/lib/defaults';
import { PropertyPdfDocument } from '@/lib/pdf-templates';
import type { GeneratedPdf, GenerationPayload, Language } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  rawText: z.string().optional(),
  fields: z.object({}).passthrough(),
  advisor: z.object({}).passthrough(),
  images: z.array(z.object({}).passthrough()).default([]),
  template: z.enum(['premium-brochure', 'technical-sheet']).default('premium-brochure'),
  copy: z.object({}).passthrough().optional()
});

function safeName(value: string) {
  return (value || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

export async function POST(request: Request) {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const payload = schema.parse(await request.json()) as unknown as GenerationPayload;
  const copy = payload.copy ?? fallbackCopy;
  const languages: Language[] = ['es', 'en'];

  const pdfs: GeneratedPdf[] = await Promise.all(languages.map(async (language) => {
    const document = React.createElement(PropertyPdfDocument, {
      language,
      fields: payload.fields,
      copy: (copy as Record<Language, typeof fallbackCopy['es']>)[language] ?? fallbackCopy[language],
      advisor: payload.advisor,
      images: payload.images,
      template: payload.template
    });
    const buffer = await renderToBuffer(document);
    return {
      language,
      filename: `${safeName(payload.fields.title as string)}-${payload.template}-${language}.pdf`,
      base64: Buffer.from(buffer).toString('base64'),
      mimeType: 'application/pdf' as const
    };
  }));

  return NextResponse.json({ pdfs, generatedAt: new Date().toISOString() });
}
