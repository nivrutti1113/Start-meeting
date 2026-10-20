import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_COOKIE_NAME = "meetpulse_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "meetpulse_enterprise_super_secret_jwt_hmac_key_2026";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "GUEST";
  companyId: string;
  companyName: string;
}

/**
 * Hash a plain text password using Node.js scrypt with a unique random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a plain text password against a stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Create a cryptographically signed HMAC-SHA256 JWT-like session token
 */
export function createSignedToken(payload: AuthSession): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE_SECONDS;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed session token
 */
export function verifySignedToken(token: string): AuthSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      companyId: decoded.companyId,
      companyName: decoded.companyName,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Retrieve the current authenticated user session from HTTP cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySignedToken(token);
}

/**
 * Require valid session or return null / throw
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Cookie options for setting HTTP-only session cookie
 */
export function getSessionCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: TOKEN_MAX_AGE_SECONDS,
    path: "/",
  };
}

/**
 * Ensures demo company and seeded credentials exist for zero-setup local & demo runs
 */
export async function ensureDemoSeed() {
  try {
    let company = await prisma.company.findFirst({
      where: { name: "Acme Tech Corp" },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "Acme Tech Corp",
          subscriptionPlan: "ENTERPRISE",
        },
      });
    }

    // Seed admin
    const adminEmail = "admin@acme.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          companyId: company.id,
          name: "Alex Vance (Admin)",
          email: adminEmail,
          passwordHash: hashPassword("admin123"),
          role: "ADMIN",
          phone: "+15550192834",
          jobTitle: "VP of Engineering",
        },
      });
    }

    // Seed employee
    const employeeEmail = "priya@acme.com";
    const existingEmp = await prisma.user.findUnique({ where: { email: employeeEmail } });
    if (!existingEmp) {
      await prisma.user.create({
        data: {
          companyId: company.id,
          name: "Priya Sharma",
          email: employeeEmail,
          passwordHash: hashPassword("employee123"),
          role: "EMPLOYEE",
          phone: "+15559876543",
          jobTitle: "Backend Systems Lead",
        },
      });
    }
  } catch (err) {
    console.warn("Bootstrap seed notice:", err);
  }
}
