"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Input } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("registerError"));
        return;
      }

      router.push("/login");
    } catch {
      setError(t("registerError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {t("registerTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Input
          label={t("name")}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t("name")}
        />

        <Input
          label={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@example.com"
        />

        <Input
          label={t("phone")}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
        />

        <Input
          label={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="********"
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "..." : t("register")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
