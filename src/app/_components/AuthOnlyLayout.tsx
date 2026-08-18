import { getSession } from "@/modules/auth/server";
import { redirect } from "next/navigation";

export async function AuthOnlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return children;
}
