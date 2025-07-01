import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, company, email, message } = await req.json();

  if (!name || !company || !email || !message) {
    return NextResponse.json({ error: 'Vsa polja so obvezna.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Resend API key ni nastavljen.' }, { status: 500 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MojaMalca <noreply@mojamalca.si>',
      to: ['prodaja@mojamalca.si'],
      subject: 'Novo povpraševanje preko spletnega obrazca',
      html: `<p><b>Ime in priimek:</b> ${name}</p><p><b>Ime podjetja:</b> ${company}</p><p><b>E-pošta:</b> ${email}</p><p><b>Sporočilo:</b><br/>${message.replace(/\n/g, '<br/>')}</p>`
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return NextResponse.json({ error: error.message || 'Napaka pri pošiljanju sporočila.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 