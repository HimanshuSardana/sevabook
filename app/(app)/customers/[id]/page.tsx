import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProfileActions } from "./actions";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
            {customer.phone && <p>📞 {customer.phone}</p>}
            {customer.address && <p>📍 {customer.address}</p>}
            {customer.serviceType && (
              <p>
                🔧 <Badge variant="outline">{customer.serviceType}</Badge>
              </p>
            )}
          </div>
          {customer.notes && (
            <p className="mt-2 text-sm italic text-muted-foreground">
              {customer.notes}
            </p>
          )}
        </div>
        <CustomerProfileActions customer={customer} />
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">
            Services ({services.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="complaints">
            Complaints ({complaints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4 space-y-3">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No service history.</p>
          ) : (
            services.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last: {new Date(s.lastServiceDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium">
                      Next due: {new Date(s.nextDueDate).toLocaleDateString()}
                    </p>
                    {s.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      s.status === "overdue"
                        ? "destructive"
                        : s.status === "completed"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {s.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment history.</p>
          ) : (
            payments.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">₹{p.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString()} · {p.paymentMode}
                    </p>
                    {p.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      p.status === "paid"
                        ? "default"
                        : p.status === "partial"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {p.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="complaints" className="mt-4 space-y-3">
          {complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No complaints logged.</p>
          ) : (
            complaints.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p>{c.complaint}</p>
                      {c.resolutionNotes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Resolution: {c.resolutionNotes}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        c.status === "resolved"
                          ? "default"
                          : c.status === "in_progress"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
