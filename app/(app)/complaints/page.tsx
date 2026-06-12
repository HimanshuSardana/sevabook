import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ComplaintsClient } from "./complaints-client";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const complaints = await db.query.complaints.findMany({
    orderBy: (c) => c.createdAt,
    with: { customer: true },
  });

  const customers = await db.query.customers.findMany({
    orderBy: (c) => c.name,
  });

  return <ComplaintsClient complaints={complaints} customers={customers} />;
}
