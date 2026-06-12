"use server";

import { db, schema } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPayment(data: {
  customerId: number;
  amount: number;
  paymentDate: string;
  paymentMode: "cash" | "upi";
  status: "paid" | "partial" | "unpaid";
  notes?: string;
}) {
  await db.insert(schema.payments).values({
    customerId: data.customerId,
    amount: data.amount,
    paymentDate: data.paymentDate,
    paymentMode: data.paymentMode,
    status: data.status,
    notes: data.notes,
  });
  revalidatePath("/payments");
  revalidatePath(`/customers/${data.customerId}`);
}
