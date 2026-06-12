"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import type { customers as customersTable } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export function CustomerProfileActions({
  customer,
}: {
  customer: Customer;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    await deleteCustomer(customer.id);
    toast.success("Customer deleted");
    router.push("/customers");
  }

  return (
    <div className="flex gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {/* Use a span as trigger since Button can't be nested inside dialog trigger */}
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialData={{
              id: customer.id,
              name: customer.name,
              phone: customer.phone ?? "",
              address: customer.address ?? "",
              serviceType: customer.serviceType ?? "",
              notes: customer.notes ?? "",
            }}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="outline" size="sm" className="text-destructive">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
