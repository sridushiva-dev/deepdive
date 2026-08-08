"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ConstellationMap } from "@/components/constellation/constellation-map";
import { Logo } from "@/components/layout/navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicDivePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<{
    session: {
      title: string;
      nodeCount: number;
      depthMax: number;
      totalMinutes: number;
      nodes: Array<{
        id: string;
        label: string;
        state: string;
        depth: number;
        summary: string | null;
        positionX: number;
        positionY: number;
        parentId: string | null;
      }>;
      user: { name: string | null };
    };
    share: { visibility: string };
  } | null>(null);

  useEffect(() => {
    fetch(`/api/dive/${slug}`)
      .then((r) => r.json())
      .then(setData);
  }, [slug]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center starfield">
        <p className="text-muted">Loading dive...</p>
      </div>
    );
  }

  const { session } = data;

  return (
    <div className="min-h-screen starfield">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <Link href="/signup">
            <Button size="sm">Start your dive</Button>
          </Link>
        </div>
      </header>

      <main className="pt-24 px-4 pb-12 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-muted text-sm mt-1">
            {session.nodeCount} concepts · {session.depthMax} levels deep ·{" "}
            {session.totalMinutes} min
            {session.user.name && ` · Dived by ${session.user.name}`}
          </p>
        </div>

        <ConstellationMap
          nodes={session.nodes.map((n) => ({
            ...n,
            summary: n.summary ?? undefined,
          }))}
          stats={{
            nodeCount: session.nodeCount,
            depthMax: session.depthMax,
            minutes: session.totalMinutes,
          }}
        />
      </main>
    </div>
  );
}
