import nodemailer from "nodemailer";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { getServerConfig } from "./config.server";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const config = getServerConfig();

  // 1. Try Resend API first if configured
  if (config.resendApiKey) {
    try {
      console.log(`[Email Server] Intentando enviar correo mediante Resend API a ${to}...`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.smtpFrom,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || `HTTP error ${response.status}`);
      }

      console.log(`[Email Server] Correo enviado exitosamente mediante Resend API a ${to}`);
      return;
    } catch (error) {
      console.error("[Email Server] Error enviando correo mediante Resend API:", error);
      // Fall through to SMTP or logging
    }
  }

  // 2. Try SMTP if configured
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    try {
      console.log(`[Email Server] Intentando enviar correo mediante SMTP (${config.smtpHost}) a ${to}...`);
      
      const isOutlook = config.smtpHost.includes("outlook") || config.smtpHost.includes("office365");
      
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpPort === 465, // true for SSL/TLS, false for STARTTLS (587)
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
        requireTLS: config.smtpPort === 587 || isOutlook,
        tls: {
          rejectUnauthorized: false,
          minVersion: "TLSv1.2" // Office 365 requires TLS 1.2 or 1.3
        }
      });

      await transporter.sendMail({
        from: config.smtpUser, // Force sender to match the authenticated user exactly for Office 365 compliance
        to,
        subject,
        html,
        text,
      });

      console.log(`[Email Server] Correo enviado exitosamente mediante SMTP a ${to}`);
      return;
    } catch (error) {
      console.error("[Email Server] Error enviando correo mediante SMTP:", error);
      // Fall through to logging
    }
  }

  // 3. Fallback: log email locally to console and file (very useful for local development)
  const logDir = path.join(process.cwd(), "logs");
  const logFile = path.join(logDir, "emails.log");

  const emailLogMessage = `
========================================
FECHA: ${new Date().toISOString()}
PARA: ${to}
DE: ${config.smtpFrom}
ASUNTO: ${subject}
TEXTO: ${text || "N/A"}
HTML:
${html}
========================================
`;

  console.warn(
    `[Email Server] ADVERTENCIA: No se configuraron credenciales de correo o falló el envío. Guardando correo en ${logFile}`
  );
  console.log(emailLogMessage);

  try {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, emailLogMessage, "utf-8");
  } catch (error) {
    console.error("[Email Server] Error al escribir el archivo de log de correo:", error);
  }
}
