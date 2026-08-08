"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import Link from "next/link";

export default function SettingsPage() {
  const t = useTranslations("byok");
  const { data: session } = useSession();
  const [selectedProvider, setSelectedProvider] = useState<string>("OPENAI");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveKey() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/onboarding/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: selectedProvider, apiKey }),
    });
    const data = await res.json();
    setMessage(res.ok ? t("verified") : data.error);
    setLoading(false);
  }

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 px-6 pb-20 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <Card className="glass border-border/50 mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted">Name:</span> {session?.user?.name}</p>
            <p><span className="text-muted">Email:</span> {session?.user?.email}</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>Manage your AI provider keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("selectProvider")}</Label>
              <select
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("pasteKey")}</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            {message && (
              <p className={`text-sm ${message === t("verified") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
            <Button onClick={saveKey} disabled={loading || !apiKey}>
              {loading ? "..." : t("verify")}
            </Button>
          </CardContent>
        </Card>

        {session?.user?.role === "ADMIN" && (
          <Link href="/admin" className="block mt-6">
            <Button variant="outline" className="w-full">Admin panel</Button>
          </Link>
        )}
      </main>
    </div>
  );
}
