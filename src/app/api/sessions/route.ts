import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isTopicSafe } from "@/lib/ai-providers";
import {
  DEMO_JOURNEYS,
  flattenDemoTree,
} from "@/lib/demo-content";
import { calculateNodePositions } from "@/lib/constellation-layout";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic, isDemo, demoId, curatedMapId } = await request.json();

    if (isDemo && demoId) {
      const journey = DEMO_JOURNEYS.find((j) => j.id === demoId);
      if (!journey) {
        return NextResponse.json({ error: "Demo not found" }, { status: 404 });
      }

      const session = await prisma.learningSession.create({
        data: {
          userId: user.id,
          title: journey.title,
          rootTopic: journey.rootTopic,
          isDemo: true,
          status: "ACTIVE",
        },
      });

      const flat = flattenDemoTree(journey.tree);
      const nodeInputs = flat.map((f) => ({
        id: f.node.id,
        parentId: f.parentId,
        depth: f.depth,
      }));
      const positions = calculateNodePositions(nodeInputs);

      for (const f of flat) {
        const pos = positions.get(f.node.id) ?? { x: 0, y: 0 };
        await prisma.conceptNode.create({
          data: {
            id: `${session.id}_${f.node.id}`,
            sessionId: session.id,
            parentId: f.parentId ? `${session.id}_${f.parentId}` : null,
            depth: f.depth,
            label: f.node.label,
            summary: f.node.summary,
            body: f.node.body,
            state: f.depth === 0 ? "SEED" : "DISCOVERED",
            positionX: pos.x,
            positionY: pos.y,
          },
        });
      }

      await prisma.learningSession.update({
        where: { id: session.id },
        data: { nodeCount: flat.length, depthMax: Math.max(...flat.map((f) => f.depth)) },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingStep: "DEMO_COMPLETE" },
      });

      return NextResponse.json({ sessionId: session.id });
    }

    if (curatedMapId) {
      const map = await prisma.curatedMap.findUnique({ where: { id: curatedMapId } });
      if (!map) {
        return NextResponse.json({ error: "Map not found" }, { status: 404 });
      }

      const tree = JSON.parse(map.treeJson);
      const session = await prisma.learningSession.create({
        data: {
          userId: user.id,
          title: map.title,
          rootTopic: tree.label ?? map.title,
          curatedSourceId: map.id,
          status: "ACTIVE",
        },
      });

      await seedNodesFromTree(session.id, tree, null, 0);
      return NextResponse.json({ sessionId: session.id });
    }

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 });
    }

    if (user.safeMode && !isTopicSafe(topic)) {
      return NextResponse.json({ error: "This topic is not available in safe mode. Try science, history, art, or programming." }, { status: 400 });
    }

    const session = await prisma.learningSession.create({
      data: {
        userId: user.id,
        title: topic.trim(),
        rootTopic: topic.trim(),
        status: "ACTIVE",
      },
    });

    await prisma.conceptNode.create({
      data: {
        sessionId: session.id,
        label: topic.trim(),
        summary: `Your dive into ${topic.trim()} begins here.`,
        state: "SEED",
        depth: 0,
        positionX: 0,
        positionY: 0,
      },
    });

    await prisma.learningSession.update({
      where: { id: session.id },
      data: { nodeCount: 1 },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.learningSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ sessions });
}

async function seedNodesFromTree(
  sessionId: string,
  node: { id?: string; label: string; summary?: string; body?: string; children?: unknown[] },
  parentId: string | null,
  depth: number
) {
  const nodeId = node.id ?? `node_${depth}_${node.label.slice(0, 8)}`;
  const dbId = `${sessionId}_${nodeId}`;

  await prisma.conceptNode.create({
    data: {
      id: dbId,
      sessionId,
      parentId: parentId ? `${sessionId}_${parentId}` : null,
      depth,
      label: node.label,
      summary: node.summary,
      body: node.body,
      state: depth === 0 ? "SEED" : "DISCOVERED",
      positionX: depth * 220,
      positionY: depth * 80,
    },
  });

  if (node.children && Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i] as typeof node;
      await seedNodesFromTree(sessionId, child, nodeId, depth + 1);
    }
  }
}
