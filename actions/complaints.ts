"use server";

import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createComplaint(data: {
  customerId: number;
  complaint: string;
}) {
  await db.insert(schema.complaints).values(data);
  revalidatePath("/complaints");
  revalidatePath(`/customers/${data.customerId}`);
}

export async function updateComplaintStatus(
  id: number,
  status: "open" | "in_progress" | "resolved",
  resolutionNotes?: string
) {
  await db
    .update(schema.complaints)
    .set({
      status,
      resolutionNotes: resolutionNotes ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.complaints.id, id));
  revalidatePath("/complaints");
}
