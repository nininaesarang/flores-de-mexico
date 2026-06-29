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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${hash}:${salt}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [storedHash, salt] = passwordHash.split(":");
  if (!storedHash || !salt) return false;

  const storedBuffer = Buffer.from(storedHash, "hex");
  const currentHash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

  return [currentHash, legacyHash].some((hash) => {
    const hashBuffer = Buffer.from(hash, "hex");
    return hashBuffer.length === storedBuffer.length && crypto.timingSafeEqual(hashBuffer, storedBuffer);
  });
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

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(2).max(30),
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);
    const username = data.username.replace(/@/g, "").trim();

    if (!username) {
      throw new Error("Ingresa un nombre de usuario válido.");
    }

    const users = await loadUsers();
    const emailTaken = users.some((user) => normalizeEmail(user.email) === email);
    if (emailTaken) {
      throw new Error("Ya existe una cuenta registrada con ese correo.");
    }

    users.push({
      username,
      email,
      passwordHash: hashPassword(data.password),
    });
    await saveUsers(users);

    return { success: true, user: { username, email } };
  });

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);
    const users = await loadUsers();
    const user = users.find((item) => normalizeEmail(item.email) === email);

    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    return {
      success: true,
      user: {
        username: user.username || email.split("@")[0],
        email,
      },
    };
  });

// Server Function: Send Password Reset Email
export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const email = normalizeEmail(data.email);

    const users = await loadUsers();
    const user = users.find((item) => normalizeEmail(item.email) === email);
    if (!user) {
      throw new Error("No existe una cuenta registrada con ese correo.");
    }

    // 1. Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 2. Save the reset request
    const resets = await loadResets();
    // Remove previous resets for this email to avoid duplicates
    const filteredResets = resets.filter((r) => normalizeEmail(r.email) !== email);
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
    const email = normalizeEmail(data.email);
    const { token } = data;

    const users = await loadUsers();
    const user = users.find((item) => normalizeEmail(item.email) === email);
    if (!user) {
      return { valid: false, message: "No existe una cuenta registrada con ese correo." };
    }

    const resets = await loadResets();
    const request = resets.find(
      (r) => normalizeEmail(r.email) === email && r.token === token
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
    const email = normalizeEmail(data.email);
    const { token, password } = data;

    // 1. Verify token again on the server side
    const resets = await loadResets();
    const requestIndex = resets.findIndex(
      (r) => normalizeEmail(r.email) === email && r.token === token
    );

    if (requestIndex === -1) {
      throw new Error("Token o correo de recuperación inválido.");
    }

    const request = resets[requestIndex];
    const isExpired = new Date() > new Date(request.expiresAt);
    if (isExpired) {
      throw new Error("El enlace de recuperación ha expirado.");
    }

    // 2. Update the registered user's password
    const users = await loadUsers();
    const userIndex = users.findIndex((u) => normalizeEmail(u.email) === email);

    if (userIndex === -1) {
      throw new Error("No existe una cuenta registrada con ese correo.");
    }

    users[userIndex].passwordHash = hashPassword(password);
    await saveUsers(users);

    // 3. Remove the reset token so it can't be used again
    resets.splice(requestIndex, 1);
    await saveResets(resets);

    console.log(`[Auth Server] Contraseña restablecida exitosamente para ${email}`);
    return {
      success: true,
      user: {
        username: users[userIndex].username || email.split("@")[0],
        email,
      },
    };
  });
