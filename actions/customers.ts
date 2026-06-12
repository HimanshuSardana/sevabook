"use server";

import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: {
  name: string;
  phone?: string;
  address?: string;
  serviceType?: string;
  notes?: string;
}) {
  await db.insert(schema.customers).values(data);
  revalidatePath("/customers");
}

export async function updateCustomer(
  id: number,
  data: {
    name: string;
    phone?: string;
    address?: string;
    serviceType?: string;
    notes?: string;
  }
) {
  await db
    .update(schema.customers)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.customers.id, id));
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomer(id: number) {
  await db.delete(schema.customers).where(eq(schema.customers.id, id));
  revalidatePath("/customers");
}
