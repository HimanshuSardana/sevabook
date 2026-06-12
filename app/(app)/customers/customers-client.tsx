"use client";

import { useState } from "react";
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { customers as customersTable } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomerForm } from "@/components/customer-form";
import { deleteCustomer } from "@/actions/customers";
import { toast } from "sonner";

type Customer = InferSelectModel<typeof customersTable>;

interface Props {
  customers: Customer[];
}

export function CustomersClient({ customers }: Props) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete(id: number, name: string) {
    await deleteCustomer(id);
    toast.success(`${name} deleted`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              key={editingCustomer?.id ?? "new"}
              initialData={
                editingCustomer
                  ? {
                      id: editingCustomer.id,
                      name: editingCustomer.name,
                      phone: editingCustomer.phone ?? "",
                      address: editingCustomer.address ?? "",
                      serviceType: editingCustomer.serviceType ?? "",
                      notes: editingCustomer.notes ?? "",
                    }
                  : undefined
              }
              onSuccess={() => {
                setDialogOpen(false);
                setEditingCustomer(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No customers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first customer to get started.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.phone}
                  </TableCell>
                  <TableCell>
                    {c.serviceType && (
                      <Badge variant="outline">{c.serviceType}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {c.address}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCustomer(c);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {c.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the customer and all
                              associated services, payments, and complaints.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(c.id, c.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
