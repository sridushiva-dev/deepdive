"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

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
      router.push(`/signup?callbackUrl=/explore/${mapId}`);
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
      <main className="pt-28 lg:pt-32 px-6 lg:px-10 pb-24 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
        <p className="text-muted mb-2">{t("subtitle")}</p>
        <p className="text-sm text-muted mb-12">
          Read and explore every concept for free. Sign up only when you want AI chat or your own saved dive.
        </p>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {maps.map((map) => (
            <Card key={map.id} className="glass border-border/50 hover:border-accent/30 transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{map.title}</CardTitle>
                <CardDescription className="leading-relaxed">{map.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t("estimatedTime", { minutes: map.estimatedMinutes })}
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/explore/${map.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4" />
                      Read concepts free
                    </Button>
                  </Link>
                  <Button
                    size="default"
                    className="flex-1"
                    onClick={() => forkMap(map.id)}
                    disabled={loading === map.id}
                  >
                    {loading === map.id ? "..." : session ? t("fork") : "AI dive (sign up)"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
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
