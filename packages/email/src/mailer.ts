import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";

// =============================================================================
// SMTP-Agnostic Email Client for Next.js
// =============================================================================
// Development: Sends to Mailpit (docker compose up) at localhost:1025
// Production:  Sends via any SMTP provider — set SMTP_HOST/PORT/USER/PASS env vars
//
// View dev emails at: http://localhost:8025

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    // Use TLS for standard SMTP ports (465, 587), skip for Mailpit (1025)
    secure: port === 465,
    ...(user && pass
      ? { auth: { user, pass } }
      : {}),
  });

  return transporter;
}

// =============================================================================
// Send Email
// =============================================================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from = process.env.SMTP_FROM || "noreply@example.com";

  const mailOptions: SendMailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    ...(options.text ? { text: options.text } : {}),
  };

  await getTransporter().sendMail(mailOptions);
}
