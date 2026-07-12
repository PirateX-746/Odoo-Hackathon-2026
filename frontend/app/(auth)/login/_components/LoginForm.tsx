"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Gauge } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/libs/auth";
import { APP_NAME, ROLE_LABELS, ROUTES } from "@/libs/constant";
import { DEMO_ACCOUNTS } from "@/libs/demo-accounts";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    const result = await login(values.email, values.password);
    if (!result.ok) {
      setSubmitError(result.error ?? "Unable to sign in.");
      return;
    }
    toast.success("Signed in");
    router.replace(searchParams.get("redirect") || ROUTES.DASHBOARD);
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
          <Gauge className="size-5" />
        </div>
        <h1 className="font-heading text-xl font-semibold tracking-wide text-foreground uppercase">
          {APP_NAME}
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to the dispatch console</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@transitops.dev" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {submitError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {submitError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="mb-2 font-heading text-xs tracking-widest text-muted-foreground uppercase">
          Demo accounts
        </p>
        <ul className="space-y-1.5">
          {DEMO_ACCOUNTS.map((cred) => (
            <li key={cred.email}>
              <button
                type="button"
                onClick={() => fillDemo(cred.email, cred.password)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
              >
                <span className="font-mono text-foreground">{cred.email}</span>
                <span className="text-muted-foreground">{ROLE_LABELS[cred.role]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
