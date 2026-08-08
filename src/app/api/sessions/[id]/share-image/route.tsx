import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await prisma.learningSession.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!session) {
    return new Response("Not found", { status: 404 });
  }

  const nodeCount = session.nodeCount;
  const depthMax = session.depthMax;
  const minutes = session.totalMinutes;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#050508",
          padding: 60,
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: "rgba(94, 158, 255, 0.3)",
            }}
          />
          <span style={{ color: "#5e9eff", fontSize: 24, fontWeight: 600 }}>Deep Dive</span>
        </div>

        <h1
          style={{
            color: "#f5f5f7",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {session.title}
        </h1>

        <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
          <span style={{ color: "#86868b", fontSize: 22 }}>
            {nodeCount} concepts
          </span>
          <span style={{ color: "#86868b", fontSize: 22 }}>
            {depthMax} levels deep
          </span>
          <span style={{ color: "#86868b", fontSize: 22 }}>
            {minutes} min in the ocean
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 48 }}>
          {Array.from({ length: Math.min(nodeCount, 12) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                background: i < depthMax ? "#c8a84a" : "#5e9eff",
                opacity: 0.4 + (i / 12) * 0.6,
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ color: "#86868b", fontSize: 18 }}>
            {session.user.name ? `Dived by ${session.user.name}` : "A curious learner"}
          </span>
          <span style={{ color: "#5e9eff", fontSize: 18 }}>deepdive.app</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
