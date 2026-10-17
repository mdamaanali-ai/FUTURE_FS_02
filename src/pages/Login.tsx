import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/admin");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm border border-border bg-white p-8">
        <p className="micro-label text-muted-foreground">Restricted area</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lead data is private. Sign in with the admin account to open the
          dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {login.error && (
            <p role="alert" className="text-sm text-destructive">
              {login.error.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={login.isPending}
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to site
        </a>
      </div>
    </div>
  );
}
