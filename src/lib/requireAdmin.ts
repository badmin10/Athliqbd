import { auth } from "@/lib/auth";

/** Returns the session if logged in, or null. Use in admin API routes to gate access. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}
