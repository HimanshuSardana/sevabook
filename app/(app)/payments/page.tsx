import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentsClient } from "./payments-client";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const payments = await db.query.payments.findMany({
    orderBy: (p) => p.paymentDate,
    with: { customer: true },
  });

  const customers = await db.query.customers.findMany({
    orderBy: (c) => c.name,
  });

  return <PaymentsClient payments={payments} customers={customers} />;
}
