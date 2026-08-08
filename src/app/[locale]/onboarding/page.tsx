"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/layout/navbar";
import { Key, Play, ChevronRight, Check } from "lucide-react";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { DEMO_JOURNEYS } from "@/lib/demo-content";

type Step = "profile" | "ai-path" | "byok" | "demo-select";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tb = useTranslations("byok");
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<Step>("profile");
  const [birthDate, setBirthDate] = useState("");
  const [locale, setLocale] = useState("en");
  const [safeMode, setSafeMode] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveProfile() {
    setLoading(true);
    const res = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate, locale, safeMode, parentEmail }),
    });
    if (res.ok) {
      setStep("ai-path");
    }
    setLoading(false);
  }

  async function verifyKey() {
    if (!selectedProvider || !apiKey) return;
    setVerifying(true);
    setVerifyError("");

    const res = await fetch("/api/onboarding/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: selectedProvider, apiKey }),
    });

    const data = await res.json();
    if (!res.ok) {
      setVerifyError(data.error ?? "Verification failed");
      setVerifying(false);
      return;
    }

    await update({ onboardingStep: "KEY_VERIFIED" });
    router.push("/welcome");
    setVerifying(false);
  }

  async function startDemo(demoId: string) {
    setLoading(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDemo: true, demoId }),
    });
    const data = await res.json();
    if (res.ok) {
      await update({ onboardingStep: "DEMO_COMPLETE" });
      router.push(`/session/${data.sessionId}`);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen starfield flex flex-col items-center justify-center p-6">
      <Logo className="mb-12" />

      <AnimatePresence mode="wait">
        {step === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>{t("profileTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("birthDate")}</Label>
                  <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("language")}</Label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={safeMode} onChange={(e) => setSafeMode(e.target.checked)} />
                  {t("safeMode")}
                </label>
                <div className="space-y-2">
                  <Label>{t("parentEmail")}</Label>
                  <Input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                  />
                </div>
                <Button className="w-full" onClick={saveProfile} disabled={loading || !birthDate}>
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "ai-path" && (
          <motion.div
            key="ai-path"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg space-y-4"
          >
            <h2 className="text-2xl font-semibold text-center mb-6">{t("aiPathTitle")}</h2>
            <button
              onClick={() => setStep("byok")}
              className="w-full glass rounded-2xl p-6 border border-border hover:border-accent/50 transition-all text-left group"
            >
              <Key className="w-8 h-8 text-accent mb-3" />
              <h3 className="text-lg font-semibold">{t("byok")}</h3>
              <p className="text-sm text-muted mt-1">{t("byokDesc")}</p>
            </button>
            <button
              onClick={() => setStep("demo-select")}
              className="w-full glass rounded-2xl p-6 border border-border hover:border-accent-deep/50 transition-all text-left group"
            >
              <Play className="w-8 h-8 text-accent-deep mb-3" />
              <h3 className="text-lg font-semibold">{t("demo")}</h3>
              <p className="text-sm text-muted mt-1">{t("demoDesc")}</p>
            </button>
          </motion.div>
        )}

        {step === "byok" && (
          <motion.div
            key="byok"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>{tb("title")}</CardTitle>
                <CardDescription>{tb("selectProvider")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {AI_PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`p-3 rounded-xl border text-sm transition-all ${
                        selectedProvider === p.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/30"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {selectedProvider && (
                  <>
                    <p className="text-xs text-muted">
                      {tb("howToGet")}:{" "}
                      <a
                        href={AI_PROVIDERS.find((p) => p.id === selectedProvider)?.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Open provider docs
                      </a>
                    </p>
                    <div className="space-y-2">
                      <Label>{tb("pasteKey")}</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                    </div>
                    {verifyError && <p className="text-sm text-red-400">{verifyError}</p>}
                    <Button
                      className="w-full"
                      onClick={verifyKey}
                      disabled={verifying || !apiKey}
                    >
                      {verifying ? "Verifying..." : tb("verify")}
                    </Button>
                  </>
                )}

                <Button variant="ghost" className="w-full" onClick={() => setStep("ai-path")}>
                  Back
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "demo-select" && (
          <motion.div
            key="demo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg space-y-4"
          >
            <h2 className="text-xl font-semibold text-center mb-4">Choose a demo dive</h2>
            {DEMO_JOURNEYS.map((j) => (
              <button
                key={j.id}
                onClick={() => startDemo(j.id)}
                disabled={loading}
                className="w-full glass rounded-2xl p-5 border border-border hover:border-accent/50 transition-all text-left"
              >
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-sm text-muted mt-1">{j.rootTopic}</p>
              </button>
            ))}
            <Button variant="ghost" className="w-full" onClick={() => setStep("ai-path")}>
              Back
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
