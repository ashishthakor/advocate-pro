import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

function validatePayload(payload: Partial<ContactPayload>) {
  const errors: Record<string, string> = {};
  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim();
  const subject = (payload.subject || '').trim();
  const message = (payload.message || '').trim();

  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';
  if (!subject) errors.subject = 'Subject is required';
  if (!message) errors.message = 'Message is required';
  else if (message.length < 10) errors.message = 'Message must be at least 10 characters';

  return { isValid: Object.keys(errors).length === 0, errors };
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured' }, { status: 500 });
  }

  const toAddress = process.env.CONTACT_TO_EMAIL || 'contact@example.com';

  try {
    const body: Partial<ContactPayload> = await request.json();
    const { isValid, errors } = validatePayload(body);
    if (!isValid) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const subject = (body.subject || '').trim();
    const message = (body.message || '').trim();

    const html = `
      <div>
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      </div>
    `;

    const { error } = await resend.emails.send({
    //   from: `Arbitalk Contact <no-reply@${(process.env.RESEND_DOMAIN || 'example.com')}>`,
      from: `onboarding@resend.dev`,
      to: [toAddress],
      replyTo: email,
      subject: `Arbitalk Contact: ${subject}`,
      html,
    });

    if (error) {
        console.log("🚀 ~ POST ~ error:", error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}


