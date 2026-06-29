import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { sendEmail } from "../email.server";

// Paths for our simple local file-based database
const DATA_DIR = path.join(process.cwd(), "data");
const RESETS_FILE = path.join(DATA_DIR, "password-resets.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

interface ResetRequest {
  email: string;
  token: string;
  expiresAt: string;
}

interface User {
  username?: string;
  email: string;
  passwordHash: string;
}

// Helper to ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Already exists or can't create
  }
}

// Helper to load reset requests
async function loadResets(): Promise<ResetRequest[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(RESETS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to save reset requests
async function saveResets(resets: ResetRequest[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(RESETS_FILE, JSON.stringify(resets, null, 2), "utf-8");
}

// Helper to load users (so we can check if user exists, and simulate database updates)
async function loadUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to save users
async function saveUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Server Function: Send Password Reset Email
export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const { email } = data;

    // 1. Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 2. Save the reset request
    const resets = await loadResets();
    // Remove previous resets for this email to avoid duplicates
    const filteredResets = resets.filter((r) => r.email.toLowerCase() !== email.toLowerCase());
    filteredResets.push({ email, token, expiresAt });
    await saveResets(filteredResets);

    // 3. Determine host origin for the reset link
    let origin = "http://localhost:3000";
    try {
      const request = getRequest();
      if (request) {
        try {
          const url = new URL(request.url);
          origin = url.origin;
        } catch {
          const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
          if (host) {
            const proto = request.headers.get("x-forwarded-proto") || "http";
            origin = `${proto}://${host}`;
          }
        }
      }
    } catch {
      // getRequest might throw if run in non-server context, fallback to default origin
    }

    const resetLink = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;

    // 4. Send email
    const subject = "Recuperar contraseña — Flores de México";
    const text = `Hola,\n\nHas solicitado restablecer tu contraseña para Flores de México.\n\nPor favor, haz clic en el siguiente enlace para elegir una nueva contraseña. Este enlace expirará en 1 hora:\n\n${resetLink}\n\nSi no solicitaste este cambio, por favor ignora este correo.\n\n© 2026 NINI TECHNOLOGIES`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f7f1ea; padding: 40px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 16px; border: 2px dashed #f9a8d4; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #be185d; margin: 0; font-size: 22px;">Flores de México</h2>
          </div>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            ¡Hola!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer la contraseña asociada a tu correo electrónico.
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Por favor, haz clic en el botón de abajo para elegir una nueva contraseña. Este enlace es válido por 1 hora.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #be185d; color: #ffffff; padding: 14px 30px; border-radius: 9999px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(190, 24, 93, 0.2); font-size: 14px; letter-spacing: 0.5px;">
              RESTABLECER CONTRASEÑA
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no cambiará hasta que accedas al enlace.
          </p>
          <p style="color: #9ca3af; font-size: 10px; text-align: center; margin-top: 10px;">
            © 2026 NINI TECHNOLOGIES
          </p>
        </div>
      </div>
    `;

    await sendEmail({ to: email, subject, html, text });

    return { success: true };
  });

// Server Function: Verify Reset Token
export const verifyResetToken = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email(), token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { email, token } = data;

    const resets = await loadResets();
    const request = resets.find(
      (r) => r.email.toLowerCase() === email.toLowerCase() && r.token === token
    );

    if (!request) {
      return { valid: false, message: "Token o correo inválido." };
    }

    const isExpired = new Date() > new Date(request.expiresAt);
    if (isExpired) {
      return { valid: false, message: "El enlace de recuperación ha expirado." };
    }

    return { valid: true };
  });

// Server Function: Reset Password
export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      token: z.string().min(1),
      password: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    const { email, token, password } = data;

    // 1. Verify token again on the server side
    const resets = await loadResets();
    const requestIndex = resets.findIndex(
      (r) => r.email.toLowerCase() === email.toLowerCase() && r.token === token
    );

    if (requestIndex === -1) {
      throw new Error("Token o correo de recuperación inválido.");
    }

    const request = resets[requestIndex];
    const isExpired = new Date() > new Date(request.expiresAt);
    if (isExpired) {
      throw new Error("El enlace de recuperación ha expirado.");
    }

    // 2. Simulate database update
    // Update or create user in users.json
    const users = await loadUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

    // Simple password hashing simulation (in a real production app we would use bcrypt/argon2,
    // but for mock file DB, saving it directly or simple hash is fine)
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex") + ":" + salt;

    if (userIndex !== -1) {
      users[userIndex].passwordHash = passwordHash;
    } else {
      // Create user if they reset password but didn't exist in our mock db
      users.push({
        email: email.toLowerCase(),
        passwordHash,
        username: email.split("@")[0], // default username
      });
    }
    await saveUsers(users);

    // 3. Remove the reset token so it can't be used again
    resets.splice(requestIndex, 1);
    await saveResets(resets);

    console.log(`[Auth Server] Contraseña restablecida exitosamente para ${email}`);
    return { success: true };
  });
