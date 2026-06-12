"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { services as servicesTable, customers as customersTable } from "@/lib/db/schema";
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
import { createService, completeService } from "@/actions/services";
import { toast } from "sonner";

type Service = InferSelectModel<typeof servicesTable> & {
  customer: InferSelectModel<typeof customersTable> | null;
};
type Customer = InferSelectModel<typeof customersTable>;

interface Props {
  services: Service[];
  customers: Customer[];
}

export function ServicesClient({ services, customers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await createService({
      customerId: Number(form.get("customerId")),
      lastServiceDate: form.get("lastServiceDate") as string,
      nextDueDate: form.get("nextDueDate") as string,
      notes: (form.get("notes") as string) || undefined,
    });

    setLoading(false);
    setDialogOpen(false);
    toast.success("Service added");
  }

  async function handleComplete(id: number) {
    await completeService(id);
    toast.success("Service marked completed");
  }

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Schedule Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Service</DialogTitle>
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
                <Label htmlFor="lastServiceDate">Last Service Date</Label>
                <Input
                  id="lastServiceDate"
                  name="lastServiceDate"
                  type="date"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Next Due Date *</Label>
                <Input
                  id="nextDueDate"
                  name="nextDueDate"
                  type="date"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Service notes..."
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Schedule Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No services scheduled</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule your first service.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/customers/${s.customerId}`}
                      className="font-medium hover:underline"
                    >
                      {s.customer?.name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.lastServiceDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.nextDueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(s.id)}
                      >
                        Complete
                      </Button>
                    )}
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
