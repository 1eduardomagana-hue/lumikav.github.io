import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  message: z.string().optional(),
  pdfs: z.array(z.object({ filename: z.string(), base64: z.string(), mimeType: z.string() })).min(1)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({
      mode: 'simulation',
      sentAt: new Date().toISOString(),
      recipients: body.to,
      attachmentCount: body.pdfs.length,
      message: 'RESEND_API_KEY is not configured, so no email was sent.'
    });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Brochure Studio <onboarding@resend.dev>',
    to: body.to,
    subject: body.subject,
    html: `<p>${body.message || 'Please find the requested real estate PDFs attached.'}</p>`,
    attachments: body.pdfs.map((pdf) => ({ filename: pdf.filename, content: pdf.base64 }))
  });

  return NextResponse.json({ mode: 'resend', response, sentAt: new Date().toISOString() });
}
