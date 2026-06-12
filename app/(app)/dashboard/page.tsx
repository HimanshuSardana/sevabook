import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, sql, and, lte, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  // ── Stats ──
  const todayVisits = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.services)
    .where(
      and(
        eq(schema.services.status, "scheduled"),
        lte(schema.services.nextDueDate, today)
      )
    );

  const pendingPayments = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${schema.payments.amount}), 0)`,
    })
    .from(schema.payments)
    .where(
      sql`${schema.payments.status} != 'paid'`
    );

  const upcomingRenewals = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.services)
    .where(
      and(
        eq(schema.services.status, "scheduled"),
        gte(schema.services.nextDueDate, today),
        lte(schema.services.nextDueDate, weekLater)
      )
    );

  const openComplaints = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.complaints)
    .where(
      sql`${schema.complaints.status} in ('open', 'in_progress')`
    );

  // ── Upcoming services ──
  const upcomingServices = await db.query.services.findMany({
    where: eq(schema.services.status, "scheduled"),
    orderBy: (s) => s.nextDueDate,
    limit: 10,
    with: { customer: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayVisits[0]?.count ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingPayments[0]?.count ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              ₹{((pendingPayments[0]?.total ?? 0) as number).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Renewals This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingRenewals[0]?.count ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openComplaints[0]?.count ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Services</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming services.</p>
          ) : (
            <div className="space-y-3">
              {upcomingServices.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{s.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(s.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      new Date(s.nextDueDate) <= new Date()
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {new Date(s.nextDueDate) <= new Date() ? "Overdue" : "Scheduled"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
