"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { payments as paymentsTable, customers as customersTable } from "@/lib/db/schema";
import {
  Plus,
  Banknote,
  User,
  Calendar,
  IndianRupee,
  Smartphone,
  Wallet,
} from "lucide-react";
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

const modeIcons = {
  cash: Wallet,
  upi: Smartphone,
};

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

  const totalCollected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingTotal = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Banknote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Payments</h1>
            <p className="text-sm text-muted-foreground">
              {payments.length} transactions
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Date *</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMode">Mode</Label>
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
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Saving..." : "Record Payment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary mini-cards */}
      {payments.length > 0 && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
            <div className="rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-950/30">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-sm font-semibold">₹{totalCollected.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
            <div className="rounded-full bg-amber-50 p-1.5 dark:bg-amber-950/30">
              <IndianRupee className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-sm font-semibold">₹{pendingTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Banknote className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No payments recorded</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Record your first payment to start tracking finances.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Amount</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Mode</TableHead>
                <TableHead className="font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const ModeIcon = modeIcons[p.paymentMode];
                return (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <Link
                        href={`/customers/${p.customerId}`}
                        className="flex items-center gap-2 font-medium hover:text-primary"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {p.customer?.name ?? "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {p.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5">
                        <ModeIcon className="h-3 w-3" />
                        {p.paymentMode === "upi" ? "UPI" : "Cash"}
                      </Badge>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
