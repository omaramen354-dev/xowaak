"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  locale: z.string().default("ar"),
});

/** Public sign-up. Always creates a `client`; staff roles are granted in admin. */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isDatabaseConfigured) {
    return { ok: false, message: "The database is not connected yet. Set DATABASE_URL." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const { name, email, password, company, phone, locale } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return {
      ok: false,
      message: "An account with this email already exists. Try signing in.",
      fieldErrors: { email: "Already registered." },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      company: company || null,
      phone: phone || null,
      locale,
      role: "client",
    })
    .returning({ id: users.id });

  // Link any earlier quote request from the same address to the new account.
  await db
    .update(leads)
    .set({ convertedUserId: created.id, status: "qualified" })
    .where(eq(leads.email, email));

  await signIn("credentials", { email, password, redirect: false });
  redirect(`/${locale}/portal`);
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  locale: z.string().default("ar"),
});

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isDatabaseConfigured) {
    return { ok: false, message: "The database is not connected yet. Set DATABASE_URL." };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const { email, password, locale } = parsed.data;
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Incorrect email or password." };
    }
    throw error;
  }
  redirect(`/${locale}/portal`);
}

export async function signOutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ar");
  await signOut({ redirectTo: `/${locale}` });
}
