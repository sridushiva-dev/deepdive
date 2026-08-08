"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CuratedMap {
  id: string;
  title: string;
  published: boolean;
  estimatedMinutes: number;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [maps, setMaps] = useState<CuratedMap[]>([]);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetch("/api/curated")
      .then((r) => r.json())
      .then((d) => setMaps(d.maps ?? []));
  }, [session, router]);

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 px-6 pb-20 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin — Curated Maps</h1>
        <div className="space-y-3">
          {maps.map((map) => (
            <Card key={map.id} className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-base">{map.title}</CardTitle>
                  <p className="text-sm text-muted">{map.estimatedMinutes} min</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  map.published ? "bg-green-500/20 text-green-400" : "bg-muted/20 text-muted"
                }`}>
                  {map.published ? "Published" : "Draft"}
                </span>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted mt-6">
          {maps.length} curated maps loaded from seed data.
        </p>
      </main>
    </div>
  );
}
