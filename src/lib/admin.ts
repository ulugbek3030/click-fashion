import { auth } from "@/lib/auth";

/**
 * Check if the current user is an admin.
 * Returns the session if authorized, or null if not.
 */
export async function requireAdmin() {
  const session = await auth();
  if (
    !session?.user?.id ||
    !["ADMIN", "SUPER_ADMIN"].includes(
      (session.user as { role?: string }).role || ""
    )
  ) {
    return null;
  }
  return session;
}
