import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, sql, and, lte, gte } from "drizzle-orm";
import Link from "next/link";
import {
  CalendarCheck2,
  IndianRupee,
  RefreshCw,
  MessageCircleWarning,
  ArrowRight,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [todayVisits] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.services)
    .where(
      and(
        eq(schema.services.status, "scheduled"),
        lte(schema.services.nextDueDate, today)
      )
    );

  const [pendingPayments] = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${schema.payments.amount}), 0)`,
    })
    .from(schema.payments)
    .where(sql`${schema.payments.status} != 'paid'`);

  const [upcomingRenewals] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.services)
    .where(
      and(
        eq(schema.services.status, "scheduled"),
        gte(schema.services.nextDueDate, today),
        lte(schema.services.nextDueDate, weekLater)
      )
    );

  const [openComplaints] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.complaints)
    .where(sql`${schema.complaints.status} in ('open', 'in_progress')`);

  const upcomingServices = await db.query.services.findMany({
    where: eq(schema.services.status, "scheduled"),
    orderBy: (s) => s.nextDueDate,
    limit: 10,
    with: { customer: true },
  });

  const stats = [
    {
      label: "Today's Visits",
      value: todayVisits?.count ?? 0,
      icon: CalendarCheck2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Pending Payments",
      value: pendingPayments?.count ?? 0,
      subtitle: `₹${((pendingPayments?.total ?? 0) as number).toLocaleString()}`,
      icon: IndianRupee,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Renewals This Week",
      value: upcomingRenewals?.count ?? 0,
      icon: RefreshCw,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Open Complaints",
      value: openComplaints?.count ?? 0,
      icon: MessageCircleWarning,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {s.value}
                    </p>
                    {s.subtitle && (
                      <p className="text-sm font-medium text-muted-foreground">
                        {s.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={cn("rounded-xl p-3", s.bg)}>
                    <Icon className={cn("h-5 w-5", s.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Services */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Upcoming Services
          </CardTitle>
          <Link href="/services">
            <Button variant="ghost" size="sm" className="gap-1 text-sm">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingServices.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarCheck2 className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No upcoming services.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingServices.map((s) => {
                const isOverdue = new Date(s.nextDueDate) <= new Date();
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          isOverdue
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                        )}
                      >
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {s.customer?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(s.nextDueDate).toLocaleDateString()}
                          {s.customer?.serviceType &&
                            ` · ${s.customer.serviceType}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={isOverdue ? "destructive" : "secondary"}
                      className={cn(
                        "shrink-0",
                        isOverdue &&
                          "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"
                      )}
                    >
                      {isOverdue ? "Overdue" : "Scheduled"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


