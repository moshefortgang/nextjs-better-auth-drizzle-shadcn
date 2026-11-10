"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import type { UserWithRole } from "better-auth/plugins"
import {
  Ban,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  VenetianMask,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ActionResult = { error: { message?: string } | null }
// The client types only know the configured roles; stored values may hold extra ones.
type RoleInput = Parameters<typeof authClient.admin.setRole>[0]["role"]

export function UsersTable({
  users,
  currentUserId,
  adminUserIds = [],
}: {
  users: UserWithRole[]
  currentUserId: string
  /** IDs from ADMIN_USER_IDS: admins regardless of their stored role. */
  adminUserIds?: string[]
}) {
  if (users.length === 0) {
    return (
      <p className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No users found.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              isEnvAdmin={adminUserIds.includes(user.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function parseRoles(role: string | null | undefined) {
  return (role ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)
}

/** Adds or removes "admin" while keeping any other roles the user has. */
function withAdminRole(roles: string[], admin: boolean): RoleInput {
  const others = roles.filter((r) => r !== "admin" && r !== "user")
  const next = admin ? [...others, "admin"] : others
  return (next.length ? next.join(",") : "user") as RoleInput
}

function isBanActive(user: UserWithRole) {
  if (!user.banned) return false
  // Better Auth lifts expired bans on the next sign-in; treat them as lifted already.
  return !user.banExpires || new Date(user.banExpires).getTime() > Date.now()
}

function UserRow({
  user,
  isSelf,
  isEnvAdmin,
}: {
  user: UserWithRole
  isSelf: boolean
  isEnvAdmin: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const roles = parseRoles(user.role)
  const hasAdminRole = roles.includes("admin")
  const isAdmin = hasAdminRole || isEnvAdmin
  const isBanned = isBanActive(user)
  // Env admins can't be demoted, banned or deleted from the UI (the server refuses anyway).
  const isProtected = isSelf || isEnvAdmin
  const label = user.email || user.name || user.id
  const roleLabel = isEnvAdmin && !hasAdminRole ? "admin (env)" : user.role || "user"

  const run = (
    action: () => Promise<ActionResult>,
    successMessage: string,
    { redirectTo }: { redirectTo?: string } = {}
  ) => {
    startTransition(async () => {
      const { error } = await action()
      if (error) {
        toast({ variant: "destructive", title: "Action failed", description: error.message })
        return
      }
      toast({ title: successMessage })
      if (redirectTo) router.push(redirectTo)
      router.refresh()
    })
  }

  const confirmThen = (message: string, fn: () => void) => {
    if (window.confirm(message)) fn()
  }

  return (
    <TableRow data-pending={isPending || undefined} className="data-pending:opacity-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback>{(user.name || user.email || "?")[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {user.name || "—"}
              {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={isAdmin ? "default" : "secondary"}
          title={isEnvAdmin ? "Admin via ADMIN_USER_IDS" : undefined}
        >
          {roleLabel}
        </Badge>
      </TableCell>
      <TableCell>
        {isBanned ? (
          <Badge variant="destructive" title={user.banReason ?? undefined}>
            Banned
          </Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {new Date(user.createdAt).toLocaleDateString("en-US", { timeZone: "UTC" })}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              aria-label={`Actions for ${label}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {isAdmin ? (
              <DropdownMenuItem
                disabled={isProtected}
                onSelect={() =>
                  run(
                    () =>
                      authClient.admin.setRole({
                        userId: user.id,
                        role: withAdminRole(roles, false),
                      }),
                    "Admin role removed"
                  )
                }
              >
                <ShieldOff /> Remove admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={() =>
                  run(
                    () =>
                      authClient.admin.setRole({
                        userId: user.id,
                        role: withAdminRole(roles, true),
                      }),
                    "User promoted to admin"
                  )
                }
              >
                <ShieldCheck /> Make admin
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              disabled={isSelf || isBanned}
              onSelect={() =>
                run(
                  () => authClient.admin.impersonateUser({ userId: user.id }),
                  `Now signed in as ${label}`,
                  { redirectTo: "/" }
                )
              }
            >
              <VenetianMask /> Impersonate
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={isSelf}
              onSelect={() =>
                run(
                  () => authClient.admin.revokeUserSessions({ userId: user.id }),
                  "All sessions revoked"
                )
              }
            >
              <LogOut /> Sign out everywhere
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {isBanned ? (
              <DropdownMenuItem
                onSelect={() =>
                  run(() => authClient.admin.unbanUser({ userId: user.id }), "User unbanned")
                }
              >
                <UserCheck /> Unban
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isProtected}
                onSelect={() => {
                  const banReason = window.prompt(`Reason for banning ${label}?`)
                  if (banReason === null) return
                  run(
                    () =>
                      authClient.admin.banUser({
                        userId: user.id,
                        banReason: banReason || undefined,
                      }),
                    "User banned"
                  )
                }}
              >
                <Ban /> Ban
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              disabled={isProtected}
              className="text-destructive focus:text-destructive"
              onSelect={() =>
                confirmThen(`Permanently delete ${label}? This can't be undone.`, () =>
                  run(() => authClient.admin.removeUser({ userId: user.id }), "User deleted")
                )
              }
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
