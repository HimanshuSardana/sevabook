import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomersClient } from "./customers-client";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const customers = await db.query.customers.findMany({
    orderBy: (c) => c.name,
  });

  return <CustomersClient customers={customers} />;
}
