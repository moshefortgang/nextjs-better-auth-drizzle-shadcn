import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { ShieldAlert } from "lucide-react";

import { adminUserIds, auth } from "@/auth";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/users-table";
import { UsersToolbar } from "@/components/admin/users-toolbar";
import { UsersPagination } from "@/components/admin/users-pagination";

export const metadata = { title: "Users" };

const PAGE_SIZE = 10;

function AdminsOnly() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Admins only</h1>
      <p className="text-sm text-muted-foreground">
        You don&apos;t have permission to manage users.
      </p>
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { q = "", page: pageParam } = await searchParams;
  const requestedPage = Math.floor(Number(pageParam));
  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    Number.isSafeInteger((requestedPage - 1) * PAGE_SIZE)
      ? requestedPage
      : 1;

  // The proxy only does an optimistic cookie check. listUsers enforces the
  // admin permission itself, so its 401/403 is our authorization check.
  let result: Awaited<ReturnType<typeof auth.api.listUsers>>;
  try {
    result = await auth.api.listUsers({
      headers: await headers(),
      query: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...(q && { searchValue: q, searchField: "email", searchOperator: "contains" }),
      },
    });
  } catch (error) {
    if (isAPIError(error) && (error.statusCode === 401 || error.statusCode === 403)) {
      return <AdminsOnly />;
    }
    throw error;
  }

  const { users, total } = result;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Stale link or the last row on the final page was deleted: jump to the last real page.
  if (page > pageCount) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (pageCount > 1) params.set("page", String(pageCount));
    const qs = params.toString();
    redirect(qs ? `/users?${qs}` : "/users");
  }

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Users</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "user" : "users"} · manage roles, bans and sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsersToolbar defaultQuery={q} />
          <UsersTable users={users} currentUserId={session.user.id} adminUserIds={adminUserIds} />
          <UsersPagination page={page} pageCount={pageCount} />
        </CardContent>
      </Card>
    </div>
  );
}
