import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deterministicExtract } from '@/lib/extract';
import { emptyFields } from '@/lib/defaults';

export const runtime = 'nodejs';

const schema = z.object({
  rawText: z.string().default(''),
  fields: z.object({}).passthrough().optional()
});

const systemPrompt = `You are a bilingual luxury real estate marketing strategist. Extract factual property details, identify missing fields, and write premium Spanish and natural professional English marketing copy. Return strict JSON only with: fields, missingFields, copy.es, copy.en. Copy keys: headline, subheadline, description, lifestyle, amenities, highlights, cta. Do not invent numeric facts; leave unknown fields empty and list them as missing.`;

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const fallback = deterministicExtract(body.rawText, { ...emptyFields, ...(body.fields as Record<string, string> | undefined) });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ...fallback, mode: 'deterministic' });
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ rawText: body.rawText, currentFields: body.fields, fallbackShape: fallback }) }
      ]
    });
    const parsed = JSON.parse(completion.choices[0]?.message.content || '{}');
    return NextResponse.json({ ...fallback, ...parsed, mode: 'openai' });
  } catch (error) {
    return NextResponse.json({ ...fallback, mode: 'fallback', warning: error instanceof Error ? error.message : 'AI extraction failed' });
  }
}
