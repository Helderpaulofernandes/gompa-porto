import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "gompa_admin_session";

function expectedCookieValue(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256").update(`${password}:gompa-porto-admin`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expected;
}

export function checkPassword(password: string): boolean {
  return !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;
}

export { COOKIE_NAME, expectedCookieValue };
