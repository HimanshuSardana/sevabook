"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type {
  complaints as complaintsTable,
  customers as customersTable,
  ComplaintStatus,
} from "@/lib/db/schema";
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

const statusColors: Record<ComplaintStatus, "default" | "secondary" | "destructive"> = {
  open: "destructive",
  in_progress: "secondary",
  resolved: "default",
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

  async function handleStatusChange(
    id: number,
    status: ComplaintStatus
  ) {
    const notes =
      status === "resolved"
        ? prompt("Resolution notes (optional):")
        : undefined;
    await updateComplaintStatus(id, status, notes ?? undefined);
    toast.success(`Complaint marked as ${status.replace("_", " ")}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Complaints</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Log Complaint</Button>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Log Complaint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No complaints logged</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer complaints will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Resolution</TableHead>
                <TableHead className="w-32 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/customers/${c.customerId}`}
                      className="font-medium hover:underline"
                    >
                      {c.customer?.name ?? "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {c.complaint}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[c.status]}>
                      {c.status.replace("_", " ")}
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
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
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
