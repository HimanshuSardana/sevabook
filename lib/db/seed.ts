import { db } from "./index";
import { users, customers, services, payments, complaints } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Owner ──
  const [owner] = await db
    .insert(users)
    .values({ name: "Owner", phone: "9999999999" })
    .returning();
  console.log("  ✓ Owner created");

  // ── Customers ──
  const [c1, c2, c3, c4] = await db
    .insert(customers)
    .values([
      {
        name: "Rajesh Sharma",
        phone: "9876543210",
        address: "42, Green Park Colony, Delhi",
        serviceType: "RO Servicing",
        notes: "Has a Kent RO, prefers morning visits",
      },
      {
        name: "Sunita Verma",
        phone: "9876543211",
        address: "7B, Lake View Apartments, Mumbai",
        serviceType: "AC Servicing",
        notes: "Two split ACs, annual maintenance contract",
      },
      {
        name: "Amit Singh",
        phone: "9876543212",
        address: "15, Krishna Nagar, Lucknow",
        serviceType: "Electrician",
        notes: "Frequent wiring issues in old building",
      },
      {
        name: "Priya Patel",
        phone: "9876543213",
        address: "203, Sunrise Towers, Ahmedabad",
        serviceType: "CCTV Installation",
        notes: "Needs 4 cameras installed at her shop",
      },
    ])
    .returning();
  console.log("  ✓ 4 customers created");

  // ── Services ──
  const today = new Date();
  const daysAgo = (n: number) =>
    new Date(today.getTime() - n * 86400000).toISOString().split("T")[0];
  const daysFromNow = (n: number) =>
    new Date(today.getTime() + n * 86400000).toISOString().split("T")[0];

  await db.insert(services).values([
    // Rajesh - RO servicing
    {
      customerId: c1.id,
      lastServiceDate: daysAgo(90),
      nextDueDate: daysFromNow(5),
      status: "scheduled",
      notes: "Annual RO membrane replacement due",
    },
    {
      customerId: c1.id,
      lastServiceDate: daysAgo(180),
      nextDueDate: daysAgo(85),
      completedDate: daysAgo(90),
      status: "completed",
      notes: "Regular servicing done",
    },
    // Sunita - AC servicing
    {
      customerId: c2.id,
      lastServiceDate: daysAgo(30),
      nextDueDate: daysFromNow(335),
      status: "scheduled",
      notes: "Annual AC maintenance",
    },
    {
      customerId: c2.id,
      lastServiceDate: daysAgo(365),
      nextDueDate: daysAgo(30),
      completedDate: daysAgo(30),
      status: "completed",
      notes: "Gas refilled and filter cleaned",
    },
    // Amit - Electrical
    {
      customerId: c3.id,
      lastServiceDate: daysAgo(45),
      nextDueDate: daysAgo(15),
      status: "overdue",
      notes: "Pending follow-up on wiring inspection",
    },
  ]);
  console.log("  ✓ 5 services created");

  // ── Payments ──
  await db.insert(payments).values([
    {
      customerId: c1.id,
      amount: 1500,
      paymentDate: daysAgo(90),
      paymentMode: "cash",
      status: "paid",
      notes: "RO servicing + membrane replacement",
    },
    {
      customerId: c2.id,
      amount: 3500,
      paymentDate: daysAgo(30),
      paymentMode: "upi",
      status: "paid",
      notes: "AC servicing - 2 ACs",
    },
    {
      customerId: c3.id,
      amount: 800,
      paymentDate: daysAgo(45),
      paymentMode: "cash",
      status: "partial",
      notes: "Paid advance, balance remaining",
    },
    {
      customerId: c4.id,
      amount: 12000,
      paymentDate: daysAgo(10),
      paymentMode: "upi",
      status: "unpaid",
      notes: "CCTV installation - awaiting payment",
    },
  ]);
  console.log("  ✓ 4 payments created");

  // ── Complaints ──
  await db.insert(complaints).values([
    {
      customerId: c1.id,
      status: "open",
      complaint: "Water purifier making noise after last service",
    },
    {
      customerId: c2.id,
      status: "in_progress",
      complaint: "AC not cooling properly in one room",
      resolutionNotes: "Technician visited, suspecting gas leak. Will follow up.",
    },
    {
      customerId: c3.id,
      status: "resolved",
      complaint: "Main circuit breaker tripping frequently",
      resolutionNotes: "Replaced faulty MCB. Working fine now.",
    },
  ]);
  console.log("  ✓ 3 complaints created");

  console.log("\n✅ Seed complete!");
  console.log("  Login: 9999999999 / OTP: 0000");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
