"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/services", label: "Services" },
  { href: "/payments", label: "Payments" },
  { href: "/complaints", label: "Complaints" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:bg-sidebar">
        <div className="flex h-14 items-center border-b px-4 font-semibold text-lg">
          <Link href="/dashboard">SevaBook</Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <form action={logout}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground">
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
        <div className="flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium",
                pathname.startsWith(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
