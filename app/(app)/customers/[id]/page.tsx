import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProfileActions } from "./actions";
import {
  Wrench,
  Banknote,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusIcons = {
  completed: CheckCircle2,
  scheduled: Clock,
  overdue: AlertCircle,
};

const complaintStatusIcons = {
  resolved: CheckCircle2,
  in_progress: Clock,
  open: AlertCircle,
};

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const customerId = Number(id);
  if (isNaN(customerId)) notFound();

  const customer = await db.query.customers.findFirst({
    where: eq(schema.customers.id, customerId),
  });

  if (!customer) notFound();

  const services = await db.query.services.findMany({
    where: eq(schema.services.customerId, customerId),
    orderBy: (s) => s.nextDueDate,
  });

  const payments = await db.query.payments.findMany({
    where: eq(schema.payments.customerId, customerId),
    orderBy: (p) => p.paymentDate,
  });

  const complaints = await db.query.complaints.findMany({
    where: eq(schema.complaints.customerId, customerId),
    orderBy: (c) => c.createdAt,
  });

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Customer Info Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-xl font-bold text-primary">
              {customer.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.name}
            </h1>
            <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {customer.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {customer.phone}
                </span>
              )}
              {customer.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {customer.address}
                </span>
              )}
              {customer.serviceType && (
                <Badge variant="outline" className="gap-1.5">
                  <Wrench className="h-3 w-3" />
                  {customer.serviceType}
                </Badge>
              )}
            </div>
            {customer.notes && (
              <p className="mt-3 text-sm italic text-muted-foreground border-l-2 pl-3">
                {customer.notes}
              </p>
            )}
          </div>
        </div>
        <CustomerProfileActions customer={customer} />
      </div>

      {/* Summary mini cards */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
          <div className="rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-950/30">
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-sm font-semibold">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
            <div className="rounded-full bg-amber-50 p-1.5 dark:bg-amber-950/30">
              <IndianRupee className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold">
                ₹{totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="services" className="gap-2">
            <Wrench className="h-4 w-4" />
            Services ({services.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <Banknote className="h-4 w-4" />
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="complaints" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Complaints ({complaints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4 space-y-3">
          {services.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Wrench className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No service history.
              </p>
            </div>
          ) : (
            services.map((s) => {
              const StatusIcon = statusIcons[s.status] || Clock;
              return (
                <Card key={s.id} className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                          s.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                            : s.status === "overdue"
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                        }`}
                      >
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          Last: {new Date(s.lastServiceDate).toLocaleDateString()}
                        </div>
                        <p className="mt-0.5 text-sm font-medium">
                          Next due: {new Date(s.nextDueDate).toLocaleDateString()}
                        </p>
                        {s.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s.notes}
                          </p>
                        )}
                        {s.completedDate && (
                          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                            Completed: {new Date(s.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        s.status === "overdue"
                          ? "destructive"
                          : s.status === "completed"
                            ? "default"
                            : "secondary"
                      }
                      className={
                        s.status === "overdue"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                          : s.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : ""
                      }
                    >
                      {s.status === "overdue"
                        ? "Overdue"
                        : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Banknote className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No payment history.
              </p>
            </div>
          ) : (
            payments.map((p) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <IndianRupee className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        ₹{p.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()} ·{" "}
                        {p.paymentMode === "upi" ? "UPI" : "Cash"}
                      </p>
                      {p.notes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      p.status === "paid"
                        ? "default"
                        : p.status === "partial"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      p.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : p.status === "partial"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                    }
                  >
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="complaints" className="mt-4 space-y-3">
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertTriangle className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No complaints logged.
              </p>
            </div>
          ) : (
            complaints.map((c) => {
              const StatusIcon = complaintStatusIcons[c.status];
              return (
                <Card key={c.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                            c.status === "resolved"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                              : c.status === "in_progress"
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                          }`}
                        >
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p>{c.complaint}</p>
                          {c.resolutionNotes && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Resolution: {c.resolutionNotes}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          c.status === "resolved"
                            ? "default"
                            : c.status === "in_progress"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          c.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 shrink-0 ml-2"
                            : c.status === "in_progress"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 shrink-0 ml-2"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 shrink-0 ml-2"
                        }
                      >
                        {c.status === "in_progress"
                          ? "In Progress"
                          : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
