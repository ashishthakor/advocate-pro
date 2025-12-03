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

  const toAddress = (process.env.CONTACT_TO_EMAIL || '').trim();
  
  // Validate recipient email is configured
  if (!toAddress) {
    console.error('CONTACT_TO_EMAIL is not configured');
    return NextResponse.json({ error: 'Recipient email is not configured' }, { status: 500 });
  }

  // Validate email address format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toAddress)) {
    console.error('Invalid CONTACT_TO_EMAIL format:', toAddress);
    return NextResponse.json({ error: 'Invalid recipient email format' }, { status: 500 });
  }

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

    // Use verified domain if available, otherwise fallback to test domain
    const resendDomain = process.env.RESEND_DOMAIN;
    const fromAddress = resendDomain 
      ? `Arbitalk Contact <no-reply@${resendDomain}>`
      : `onboarding@resend.dev`;

    // If using test domain, warn that it can only send to account owner
    if (!resendDomain) {
      console.warn('Using test domain. Can only send to account owner email.');
    }

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: email,
      subject: `Arbitalk Contact: ${subject}`,
      html,
    });

    if (error) {
      console.error('Resend email error:', JSON.stringify(error, null, 2));
      console.error('Attempted to send to:', toAddress);
      console.error('Using from address:', fromAddress);
      
      const errorMessage = error.message || JSON.stringify(error);
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, { status: 500 });
    }

    console.log('Email sent successfully to:', toAddress);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Contact form error:', e);
    return NextResponse.json({ 
      error: 'Invalid request',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 400 });
  }
}


