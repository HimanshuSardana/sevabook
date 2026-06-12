import { relations } from "drizzle-orm";
import { users, sessions, customers, services, payments, complaints } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  services: many(services),
  payments: many(payments),
  complaints: many(complaints),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  customer: one(customers, {
    fields: [services.customerId],
    references: [customers.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  customer: one(customers, {
    fields: [complaints.customerId],
    references: [customers.id],
  }),
}));
