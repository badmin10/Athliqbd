import AdminSessionProvider from "@/components/AdminSessionProvider";
import AdminSidebar from "@/components/AdminSidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-court-white">
        {session && <AdminSidebar userName={session.user?.name ?? "Admin"} />}
        <main className="flex-1">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
