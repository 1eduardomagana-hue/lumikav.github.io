import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fallbackCopy } from '@/lib/defaults';
import { buildFlyerHtml } from '@/lib/flyer-template';
import type { GeneratedPdf, GenerationPayload, Language } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Chromium binary hosted on GitHub releases — works on Vercel Hobby
const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar';

const schema = z.object({
  rawText: z.string().optional(),
  fields: z.object({}).passthrough(),
  advisor: z.object({}).passthrough(),
  images: z.array(z.object({}).passthrough()).default([]),
  template: z.enum(['premium-brochure', 'technical-sheet']).default('premium-brochure'),
  copy: z.object({}).passthrough().optional(),
});

function safeName(value: string) {
  return (value || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function htmlToPdf(html: string): Promise<Buffer> {
  const chromium = (await import('@sparticuz/chromium-min')).default;
  const puppeteer = (await import('puppeteer-core')).default;

  const executablePath = await chromium.executablePath(CHROMIUM_URL);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 860, height: 1200 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
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

  const htmls: Record<Language, string> = {
    es: buildFlyerHtml({
      lang: 'es',
      fields: payload.fields,
      copy: copy['es'] ?? fallbackCopy['es'],
      advisor: payload.advisor,
      images: payload.images,
    }),
    en: buildFlyerHtml({
      lang: 'en',
      fields: payload.fields,
      copy: copy['en'] ?? fallbackCopy['en'],
      advisor: payload.advisor,
      images: payload.images,
    }),
  };

  const pdfs: GeneratedPdf[] = await Promise.all(
    languages.map(async (language) => {
      const buffer = await htmlToPdf(htmls[language]);
      return {
        language,
        filename: `${name}-ficha-${language}.pdf`,
        base64: buffer.toString('base64'),
        mimeType: 'application/pdf' as const,
      };
    })
  );

  return NextResponse.json({
    pdfs,
    html: {
      es: { filename: `${name}-ficha-es.html`, base64: Buffer.from(htmls.es).toString('base64') },
      en: { filename: `${name}-ficha-en.html`, base64: Buffer.from(htmls.en).toString('base64') },
    },
    generatedAt: new Date().toISOString(),
  });
}
