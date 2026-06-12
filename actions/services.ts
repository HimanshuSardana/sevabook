"use server";

import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createService(data: {
  customerId: number;
  lastServiceDate: string;
  nextDueDate: string;
  notes?: string;
}) {
  await db.insert(schema.services).values({
    customerId: data.customerId,
    lastServiceDate: data.lastServiceDate,
    nextDueDate: data.nextDueDate,
    notes: data.notes,
    status: new Date(data.nextDueDate) < new Date() ? "overdue" : "scheduled",
  });
  revalidatePath("/services");
  revalidatePath(`/customers/${data.customerId}`);
}

export async function completeService(id: number) {
  const today = new Date().toISOString().split("T")[0];
  await db
    .update(schema.services)
    .set({
      status: "completed",
      completedDate: today,
    })
    .where(eq(schema.services.id, id));
  revalidatePath("/services");
}
