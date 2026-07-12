"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { UserForm } from "../_components/UserForm";
import { createUser } from "@/services/userService";
import type { CreateUserInput } from "@/types/user";
import { extractErrorMessage } from "@/libs/helper";

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (values: CreateUserInput) => {
    try {
      await createUser(values);
      toast.success("User created");
      router.push("/users");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New user</h1>
        <p className="text-sm text-muted-foreground">Grant someone access to the dispatch console.</p>
      </div>
      <Card>
        <CardContent className="pt-4">
          <UserForm submitLabel="Create user" onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
