import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { chatWithUserAI } from "@/lib/ai-chat";
import {
  DEMO_JOURNEYS,
  findDemoNode,
} from "@/lib/demo-content";
import { calculateNodePositions } from "@/lib/constellation-layout";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const session = await prisma.learningSession.findFirst({
    where: { id, userId: user.id },
    include: { nodes: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const { message, nodeId, nodeLabel } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    await prisma.message.create({
      data: {
        sessionId: session.id,
        nodeId: nodeId ?? null,
        role: "user",
        content: message.trim(),
      },
    });

    let response: string;
    let newConcepts: Array<{ label: string; summary: string }> = [];

    if (session.isDemo) {
      const demoId = session.title.includes("Black Hole") ? "black-holes" : "python-basics";
      const journey = DEMO_JOURNEYS.find((j) => j.id === demoId);
      const responses = journey?.cannedResponses.default ?? [
        "In the demo ocean, each question opens new depths. Connect your API key to dive with real AI.",
      ];
      response = responses[Math.floor(Math.random() * responses.length)];

      if (nodeId) {
        const shortId = nodeId.replace(`${session.id}_`, "");
        const demoTree = journey?.tree;
        if (demoTree) {
          const node = findDemoNode(demoTree, shortId);
          if (node?.children) {
            for (const child of node.children.slice(0, 2)) {
              const existing = session.nodes.find((n) => n.label === child.label);
              if (!existing) {
                newConcepts.push({ label: child.label, summary: child.summary });
              }
            }
          }
        }
      }
    } else {
      const hasKey = await prisma.apiKey.findFirst({
        where: { userId: user.id, verifiedAt: { not: null } },
      });

      if (!hasKey) {
        return NextResponse.json({
          error: "Connect your API key in Settings to use AI chat.",
        }, { status: 400 });
      }

      const recentMessages = await prisma.message.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const systemPrompt = `You are Deep Dive, an AI learning companion. The user is exploring "${session.rootTopic}". ${nodeLabel ? `They are currently diving into: ${nodeLabel}.` : ""} Help them learn by explaining concepts clearly, suggesting related sub-topics to explore deeper, and encouraging curiosity. Respond in ${user.locale === "hi" ? "Hindi" : "English"}. At the end of your response, if you suggest new concepts to explore, list them as JSON array in format: [CONCEPTS:["Concept Name: brief summary", ...]]`;

      response = await chatWithUserAI(
        user.id,
        recentMessages.reverse().map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        systemPrompt
      );

      const conceptsMatch = response.match(/\[CONCEPTS:\[([\s\S]*?)\]\]/);
      if (conceptsMatch) {
        try {
          const parsed = JSON.parse(`[${conceptsMatch[1]}]`) as string[];
          newConcepts = parsed.map((c) => {
            const [label, ...rest] = c.split(":");
            return { label: label.trim(), summary: rest.join(":").trim() };
          });
          response = response.replace(/\[CONCEPTS:\[[\s\S]*?\]\]/, "").trim();
        } catch {
          // ignore parse errors
        }
      }
    }

    await prisma.message.create({
      data: {
        sessionId: session.id,
        nodeId: nodeId ?? null,
        role: "assistant",
        content: response,
      },
    });

    if (newConcepts.length > 0) {
      const parentNode = nodeId
        ? session.nodes.find((n) => n.id === nodeId)
        : session.nodes.find((n) => n.depth === 0);

      const parentDepth = parentNode?.depth ?? 0;
      const newDepth = parentDepth + 1;

      const existingLabels = new Set(session.nodes.map((n) => n.label));
      const toAdd = newConcepts.filter((c) => !existingLabels.has(c.label));

      if (toAdd.length > 0) {
        const createdIds: string[] = [];
        const layoutInputs = session.nodes.map((n) => ({
          id: n.id,
          parentId: n.parentId,
          depth: n.depth,
        }));

        for (let i = 0; i < toAdd.length; i++) {
          const newId = `${session.id}_c_${Date.now()}_${i}`;
          createdIds.push(newId);
          layoutInputs.push({
            id: newId,
            parentId: parentNode?.id ?? null,
            depth: newDepth,
          });
        }

        const positions = calculateNodePositions(layoutInputs);

        for (let i = 0; i < toAdd.length; i++) {
          const newId = createdIds[i];
          const pos = positions.get(newId) ?? { x: newDepth * 220, y: i * 100 };
          const concept = toAdd[i];

          await prisma.conceptNode.create({
            data: {
              id: newId,
              sessionId: session.id,
              parentId: parentNode?.id ?? null,
              depth: newDepth,
              label: concept.label,
              summary: concept.summary,
              state: "DISCOVERED",
              positionX: pos.x,
              positionY: pos.y,
            },
          });
        }

        const depthMax = Math.max(session.depthMax, newDepth);
        await prisma.learningSession.update({
          where: { id: session.id },
          data: {
            nodeCount: session.nodeCount + toAdd.length,
            depthMax,
            totalMinutes: session.totalMinutes + 1,
          },
        });
      }
    }

    if (nodeId) {
      await prisma.conceptNode.update({
        where: { id: nodeId },
        data: { state: "EXPLORING" },
      });
    }

    return NextResponse.json({ response, newConcepts });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Chat failed",
    }, { status: 500 });
  }
}
