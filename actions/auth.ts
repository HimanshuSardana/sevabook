"use server";

import { db, schema } from "@/lib/db";
import { otpProvider, createSession, logout as destroySession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function sendOTP(phone: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.phone, phone),
  });

  if (!user) {
    return { error: "No account found with this phone number" };
  }

  await otpProvider.sendOTP(phone);
  return { success: true };
}

export async function verifyOTP(phone: string, otp: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.phone, phone),
  });

  if (!user) {
    return { error: "No account found with this phone number" };
  }

  const valid = await otpProvider.verifyOTP(phone, otp);
  if (!valid) {
    return { error: "Invalid OTP" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
