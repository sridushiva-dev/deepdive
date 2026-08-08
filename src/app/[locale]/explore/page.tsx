"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";

interface CuratedMap {
  id: string;
  title: string;
  titleHi: string | null;
  description: string;
  descriptionHi: string | null;
  estimatedMinutes: number;
}

export default function ExplorePage() {
  const t = useTranslations("explore");
  const router = useRouter();
  const { data: session } = useSession();
  const [maps, setMaps] = useState<CuratedMap[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/curated")
      .then((r) => r.json())
      .then((d) => setMaps(d.maps ?? []));
  }, []);

  async function forkMap(mapId: string) {
    if (!session) {
      router.push(`/signup?callbackUrl=/explore&map=${mapId}`);
      return;
    }

    setLoading(mapId);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curatedMapId: mapId }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/session/${data.sessionId}`);
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 px-6 pb-20 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted mb-4">{t("subtitle")}</p>
        {!session && (
          <p className="text-sm text-muted mb-10">
            Browse freely.{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Sign up
            </Link>{" "}
            to fork a map and start diving.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {maps.map((map) => (
            <Card key={map.id} className="glass border-border/50 hover:border-accent/30 transition-all">
              <CardHeader>
                <CardTitle className="text-lg">{map.title}</CardTitle>
                <CardDescription>{map.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t("estimatedTime", { minutes: map.estimatedMinutes })}
                </span>
                <Button
                  size="sm"
                  onClick={() => forkMap(map.id)}
                  disabled={loading === map.id}
                >
                  {loading === map.id ? "..." : session ? t("fork") : "Sign up to dive"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {maps.length === 0 && (
          <p className="text-muted text-center py-12">Curated maps coming soon...</p>
        )}
      </main>
    </div>
  );
}
