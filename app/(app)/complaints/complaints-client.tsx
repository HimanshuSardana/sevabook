"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type {
  complaints as complaintsTable,
  customers as customersTable,
  ComplaintStatus,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  Plus,
  AlertTriangle,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { createComplaint, updateComplaintStatus } from "@/actions/complaints";
import { toast } from "sonner";

type Complaint = InferSelectModel<typeof complaintsTable> & {
  customer: InferSelectModel<typeof customersTable> | null;
};
type Customer = InferSelectModel<typeof customersTable>;

interface Props {
  complaints: Complaint[];
  customers: Customer[];
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; icon: typeof AlertTriangle; variant: "default" | "secondary" | "destructive"; className: string }
> = {
  open: {
    label: "Open",
    icon: AlertCircle,
    variant: "destructive",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    variant: "secondary",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    variant: "default",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
};

export function ComplaintsClient({ complaints, customers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    await createComplaint({
      customerId: Number(form.get("customerId")),
      complaint: form.get("complaint") as string,
    });

    setLoading(false);
    setDialogOpen(false);
    toast.success("Complaint logged");
  }

  async function handleStatusChange(id: number, status: ComplaintStatus) {
    const notes =
      status === "resolved"
        ? prompt("Resolution notes (optional):")
        : undefined;
    await updateComplaintStatus(id, status, notes ?? undefined);
    toast.success(`Complaint marked as ${status.replace("_", " ")}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Complaints</h1>
            <p className="text-sm text-muted-foreground">
              {complaints.length} total
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Complaint</DialogTitle>
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
                <Label htmlFor="complaint">Complaint *</Label>
                <Textarea
                  id="complaint"
                  name="complaint"
                  placeholder="Describe the issue..."
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Saving..." : "Log Complaint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No complaints logged</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer complaints will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Complaint</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="hidden font-medium md:table-cell">
                  Resolution
                </TableHead>
                <TableHead className="w-36 text-right font-medium">
                  Update
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => {
                const config = statusConfig[c.status];
                const StatusIcon = config.icon;
                return (
                  <TableRow key={c.id} className="group">
                    <TableCell>
                      <Link
                        href={`/customers/${c.customerId}`}
                        className="flex items-center gap-2 font-medium hover:text-primary"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.customer?.name ?? "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="max-w-xs truncate">{c.complaint}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className={cn("gap-1.5", config.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                      {c.resolutionNotes ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status !== "resolved" && (
                        <Select
                          defaultValue={c.status}
                          onValueChange={(v) =>
                            handleStatusChange(c.id, v as ComplaintStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">
                              <span className="flex items-center gap-2">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Open
                              </span>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <span className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                In Progress
                              </span>
                            </SelectItem>
                            <SelectItem value="resolved">
                              <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Resolved
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
