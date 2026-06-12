import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
