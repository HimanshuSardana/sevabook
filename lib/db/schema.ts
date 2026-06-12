import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ───────────────────────────── USERS ─────────────────────────────

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
});

// ───────────────────────────── SESSIONS ─────────────────────────────

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ───────────────────────────── CUSTOMERS ─────────────────────────────

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  serviceType: text("service_type"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
});

// ───────────────────────────── SERVICES ─────────────────────────────

export const serviceStatus = ["scheduled", "completed", "overdue"] as const;
export type ServiceStatus = (typeof serviceStatus)[number];

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  lastServiceDate: text("last_service_date").notNull(),
  nextDueDate: text("next_due_date").notNull(),
  completedDate: text("completed_date"),
  status: text("status", { enum: serviceStatus })
    .notNull()
    .default("scheduled"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ───────────────────────────── PAYMENTS ─────────────────────────────

export const paymentMode = ["cash", "upi"] as const;
export type PaymentMode = (typeof paymentMode)[number];

export const paymentStatus = ["paid", "partial", "unpaid"] as const;
export type PaymentStatus = (typeof paymentStatus)[number];

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  paymentMode: text("payment_mode", { enum: paymentMode }).notNull(),
  status: text("status", { enum: paymentStatus }).notNull().default("unpaid"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ───────────────────────────── COMPLAINTS ─────────────────────────────

export const complaintStatus = ["open", "in_progress", "resolved"] as const;
export type ComplaintStatus = (typeof complaintStatus)[number];

export const complaints = sqliteTable("complaints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  status: text("status", { enum: complaintStatus })
    .notNull()
    .default("open"),
  complaint: text("complaint").notNull(),
  resolutionNotes: text("resolution_notes"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
});
