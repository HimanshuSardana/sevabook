"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { services as servicesTable, customers as customersTable } from "@/lib/db/schema";
import {
  Plus,
  Wrench,
  CheckCircle2,
  Calendar,
  User,
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

const statusStyles = {
  scheduled: { variant: "secondary" as const, label: "Scheduled" },
  completed: { variant: "default" as const, label: "Completed" },
  overdue: { variant: "destructive" as const, label: "Overdue" },
};

export function ServicesClient({ services, customers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date();

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
    toast.success("Service scheduled");
  }

  async function handleComplete(id: number) {
    await completeService(id);
    toast.success("Service marked completed");
  }

  const activeServices = services.filter((s) => s.status !== "completed");
  const completedServices = services.filter((s) => s.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Services</h1>
            <p className="text-sm text-muted-foreground">
              {activeServices.length} active · {completedServices.length} completed
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Service
            </Button>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastServiceDate">Last Service</Label>
                  <Input
                    id="lastServiceDate"
                    name="lastServiceDate"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Next Due *</Label>
                  <Input
                    id="nextDueDate"
                    name="nextDueDate"
                    type="date"
                    required
                    disabled={loading}
                  />
                </div>
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
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Saving..." : "Schedule Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Wrench className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No services scheduled</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule your first service to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Last Service</TableHead>
                <TableHead className="font-medium">Next Due</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="w-28 text-right font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => {
                const isPending = s.status !== "completed";
                return (
                  <TableRow key={s.id} className="group">
                    <TableCell>
                      <Link
                        href={`/customers/${s.customerId}`}
                        className="flex items-center gap-2 font-medium hover:text-primary"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {s.customer?.name ?? "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.lastServiceDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.nextDueDate).toLocaleDateString()}
                      </span>
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
                        className={
                          s.status === "overdue"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                            : s.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : ""
                        }
                      >
                        {s.status === "overdue" ? "Overdue" : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleComplete(s.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Complete
                        </Button>
                      )}
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
