"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES, ROLE_LABELS, type Role } from "@/libs/constant";
import { listUsers, updateUser } from "@/services/userService";
import { formatDate, extractErrorMessage } from "@/libs/helper";
import { useAuth } from "@/libs/auth";
import type { User } from "@/types/user";

const ROLE_OPTIONS = Object.values(ROLES);

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listUsers().then((data) => {
      if (!active) return;
      setUsers(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const applyUpdate = (updated: User) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const handleRoleChange = async (u: User, role: Role) => {
    setPendingId(u.id);
    try {
      applyUpdate(await updateUser(u.id, { role }));
      toast.success(`${u.name}'s role updated`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleActive = async (u: User) => {
    setPendingId(u.id);
    try {
      applyUpdate(await updateUser(u.id, { isActive: !u.isActive }));
      toast.success(`${u.name} ${u.isActive ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Everyone with access to the dispatch console. Admin only.
          </p>
        </div>
        <Button render={<Link href="/users/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New User
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">Member since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-4 text-sm font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(role) => handleRoleChange(u, role as Role)}
                    >
                      <SelectTrigger
                        className="w-44"
                        disabled={pendingId === u.id || u.id === currentUser?.id}
                      >
                        <SelectValue>{(value: string) => ROLE_LABELS[value as Role]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      disabled={pendingId === u.id || u.id === currentUser?.id}
                      onClick={() => handleToggleActive(u)}
                      className="disabled:opacity-50"
                    >
                      <Badge variant={u.isActive ? "ok" : "idle"}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="pr-4 text-sm text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
