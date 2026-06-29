// app/api/contact/route.ts
// Sends contact form submissions to nexdrop.complaints@gmail.com via Resend.
import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 });
  }

  try {
    const { name, email, orderNum, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NexDrop Contact Form <onboarding@resend.dev>',
        to: ['nexdrop.complaints@gmail.com'],
        reply_to: email,
        subject: orderNum
          ? `Contact form: ${name} (Order ${orderNum})`
          : `Contact form: ${name}`,
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${orderNum ? `<p><strong>Order number:</strong> ${escapeHtml(orderNum)}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend send failed:', res.status, errText);
      return NextResponse.json({ error: 'Could not send message.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Could not send message.' }, { status: 500 });
  }
}

// Minimal HTML escaping so form input
