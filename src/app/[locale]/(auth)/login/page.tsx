"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Button, Input } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {t("loginTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Input
          label={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@example.com"
        />

        <Input
          label={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "..." : t("login")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-foreground hover:underline"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
