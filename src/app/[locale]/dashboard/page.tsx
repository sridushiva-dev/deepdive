"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getGreeting } from "@/lib/utils";
import { Compass, Clock, ArrowRight } from "lucide-react";

interface SessionSummary {
  id: string;
  title: string;
  nodeCount: number;
  depthMax: number;
  status: string;
  updatedAt: string;
  isDemo: boolean;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const name = session?.user?.name;
  const greeting = getGreeting(name);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []));
  }, []);

  async function startDive() {
    if (!topic.trim()) return;
    setLoading(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/session/${data.sessionId}`);
    } else {
      alert(data.error);
    }
    setLoading(false);
  }

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE");

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 px-6 pb-20 max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            {greeting}
          </h1>
          <p className="text-muted text-lg">Ready to dive deeper today?</p>
        </div>

        <Card className="glass border-border/50 mb-10">
          <CardContent className="p-6">
            <p className="text-sm text-muted mb-3">{t("learnToday")}</p>
            <div className="flex gap-3">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("learnPlaceholder")}
                className="text-base"
                onKeyDown={(e) => e.key === "Enter" && startDive()}
              />
              <Button onClick={startDive} disabled={loading || !topic.trim()}>
                {t("startDive")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mb-10">
          <Button variant="outline" onClick={() => router.push("/explore")}>
            <Compass className="w-4 h-4" />
            {t("exploreMaps")}
          </Button>
        </div>

        {activeSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              {t("resume")}
            </h2>
            <div className="space-y-3">
              {activeSessions.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.push(`/session/${s.id}`)}
                  className="w-full glass rounded-2xl p-5 border border-border hover:border-accent/30 transition-all text-left flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-medium group-hover:text-accent transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      {s.nodeCount} concepts · {s.depthMax} levels deep
                      {s.isDemo && " · Demo"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}