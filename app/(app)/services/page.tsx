import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ServicesClient } from "./services-client";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const services = await db.query.services.findMany({
    orderBy: (s) => s.nextDueDate,
    with: { customer: true },
  });

  const customers = await db.query.customers.findMany({
    orderBy: (c) => c.name,
  });

  return <ServicesClient services={services} customers={customers} />;
}
