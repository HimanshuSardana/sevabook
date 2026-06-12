"use client";

import { useState } from "react";
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
import { createCustomer, updateCustomer } from "@/actions/customers";
import { toast } from "sonner";

type CustomerData = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  serviceType: string;
  notes: string;
};

interface CustomerFormProps {
  initialData?: CustomerData;
  onSuccess: () => void;
}

const serviceTypes = [
  "RO Servicing",
  "AC Servicing",
  "Electrician",
  "Plumber",
  "CCTV Installation",
  "Appliance Repair",
  "Other",
];

export function CustomerForm({ initialData, onSuccess }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
      serviceType: form.get("serviceType") as string,
      notes: form.get("notes") as string,
    };

    if (!data.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    try {
      if (initialData?.id) {
        await updateCustomer(initialData.id, data);
        toast.success("Customer updated");
      } else {
        await createCustomer(data);
        toast.success("Customer created");
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="Customer name"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialData?.phone}
          placeholder="Phone number"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={initialData?.address}
          placeholder="Customer address"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceType">Service Type</Label>
        <Select name="serviceType" defaultValue={initialData?.serviceType}>
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initialData?.notes}
          placeholder="Any notes..."
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Customer" : "Add Customer"}
      </Button>
    </form>
  );
}
