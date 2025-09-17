/// <reference types="node" />

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Handler compatible con Vercel (Web API)
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();

    const {
      servicio,
      total,
      nombre,
      puesto,
      empresa,
      correo,
      celular,
      respuestas,
    } = body as {
      servicio: string;
      total: number;
      nombre: string;
      puesto?: string;
      empresa?: string;
      correo: string;
      celular?: string;
      respuestas: { id: number; texto: string; val: number }[];
    };

    const rows = respuestas
      .map(
        (r) =>
          `<tr><td style="padding:4px 8px;border:1px solid #eee;">${r.id}.</td><td style="padding:4px 8px;border:1px solid #eee;">${r.texto}</td><td style="padding:4px 8px;border:1px solid #eee;text-align:center;">${r.val}</td></tr>`
      )
      .join("");

    const html = `
      <h2>${servicio}</h2>
      <p><b>Total:</b> ${total} / 24</p>
      <h3>Contacto</h3>
      <ul>
        <li><b>Nombre:</b> ${nombre || "-"}</li>
        <li><b>Puesto:</b> ${puesto || "-"}</li>
        <li><b>Empresa:</b> ${empresa || "-"}</li>
        <li><b>Correo:</b> ${correo || "-"}</li>
        <li><b>Celular:</b> ${celular || "-"}</li>
      </ul>
      <h3>Respuestas</h3>
      <table style="border-collapse:collapse;border:1px solid #eee;">
        <thead>
          <tr>
            <th style="padding:6px 8px;border:1px solid #eee;">#</th>
            <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Pregunta</th>
            <th style="padding:6px 8px;border:1px solid #eee;">Valor</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const to = process.env.EMAIL_TO!;
    const from = process.env.EMAIL_FROM!;

    const sent = await resend.emails.send({
      from,
      to,
      subject: `Nuevo lead | ${servicio} | Total: ${total}`,
      html,
      reply_to: correo ? [correo] : undefined,
    });

    if ((sent as any).error) {
      return new Response("Resend error", { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response("Bad Request", { status: 400 });
  }
}


