import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fallbackCopy } from '@/lib/defaults';
import { buildFlyerHtml } from '@/lib/flyer-template';
import type { GeneratedPdf, GenerationPayload, Language } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

async function htmlToPdf(html: string): Promise<Buffer> {
  const chromium = (await import('@sparticuz/chromium')).default;
  const puppeteer = (await import('puppeteer-core')).default;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 860, height: 1200 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function POST(request: Request) {
  const payload = schema.parse(await request.json()) as unknown as GenerationPayload;
  const copy = (payload.copy ?? fallbackCopy) as Record<Language, typeof fallbackCopy['es']>;
  const languages: Language[] = ['es', 'en'];
  const name = safeName(payload.fields.title as string);

  // Build HTMLs first
  const htmls: Record<Language, string> = {
    es: buildFlyerHtml({ lang: 'es', fields: payload.fields, copy: copy['es'] ?? fallbackCopy['es'], advisor: payload.advisor, images: payload.images }),
    en: buildFlyerHtml({ lang: 'en', fields: payload.fields, copy: copy['en'] ?? fallbackCopy['en'], advisor: payload.advisor, images: payload.images }),
  };

  // Generate PDFs in parallel
  const pdfs: GeneratedPdf[] = await Promise.all(languages.map(async (language) => {
    const buffer = await htmlToPdf(htmls[language]);
    return {
      language,
      filename: `${name}-flyer-${language}.pdf`,
      base64: buffer.toString('base64'),
      mimeType: 'application/pdf' as const,
    };
  }));

  // Return PDFs + raw HTML for direct download
  return NextResponse.json({
    pdfs,
    html: {
      es: { filename: `${name}-flyer-es.html`, base64: Buffer.from(htmls.es).toString('base64') },
      en: { filename: `${name}-flyer-en.html`, base64: Buffer.from(htmls.en).toString('base64') },
    },
    generatedAt: new Date().toISOString(),
  });
}
