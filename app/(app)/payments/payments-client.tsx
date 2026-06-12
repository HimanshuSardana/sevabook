"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { payments as paymentsTable, customers as customersTable } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPayment } from "@/actions/payments";
import { toast } from "sonner";

type Payment = InferSelectModel<typeof paymentsTable> & {
  customer: InferSelectModel<typeof customersTable> | null;
};
type Customer = InferSelectModel<typeof customersTable>;

interface Props {
  payments: Payment[];
  customers: Customer[];
}

export function PaymentsClient({ payments, customers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await createPayment({
      customerId: Number(form.get("customerId")),
      amount: Number(form.get("amount")),
      paymentDate: form.get("paymentDate") as string,
      paymentMode: form.get("paymentMode") as "cash" | "upi",
      status: form.get("status") as "paid" | "partial" | "unpaid",
      notes: (form.get("notes") as string) || undefined,
    });

    setLoading(false);
    setDialogOpen(false);
    toast.success("Payment recorded");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select name="customerId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select name="paymentMode" defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="paid">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Payment notes..."
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No payments recorded</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Record your first payment.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/customers/${p.customerId}`}
                      className="font-medium hover:underline"
                    >
                      {p.customer?.name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.paymentMode}</Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
