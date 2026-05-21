import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  message: z.string().optional(),
  pdfs: z.array(z.object({ filename: z.string(), base64: z.string(), mimeType: z.string() })).default([]),
  _probe: z.boolean().optional(), // internal flag to check key availability
});

export async function POST(request: Request) {
  const hasKey = Boolean(process.env.RESEND_API_KEY);

  try {
    const body = schema.parse(await request.json());

    // Probe request — just return key status
    if (body._probe) {
      return NextResponse.json({ mode: hasKey ? 'resend' : 'simulation', hasKey });
    }

    if (!hasKey) {
      return NextResponse.json({
        mode: 'simulation',
        hasKey: false,
        sentAt: new Date().toISOString(),
        recipients: body.to,
        attachmentCount: body.pdfs.length,
        message: 'RESEND_API_KEY no configurada. Usa la opción manual para enviar el correo.',
      });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'LumiKav Brochure Studio <onboarding@resend.dev>',
      to: body.to,
      subject: body.subject,
      html: `<p style="font-family:sans-serif;white-space:pre-wrap">${(body.message || '').replace(/\n/g, '<br/>')}</p>`,
      attachments: body.pdfs.map(pdf => ({ filename: pdf.filename, content: pdf.base64 })),
    });

    return NextResponse.json({ mode: 'resend', hasKey: true, response, sentAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({
      mode: 'error',
      hasKey,
      message: error instanceof Error ? error.message : 'Send failed',
    }, { status: 500 });
  }
}
