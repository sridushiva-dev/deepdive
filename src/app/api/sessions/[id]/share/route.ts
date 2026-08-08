import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    const { visibility } = await request.json();

    const share = await prisma.share.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      },
    });

    if (!user.firstShareCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { firstShareCompleted: true },
      });
    }

    return NextResponse.json({ slug: share.slug, visibility: share.visibility });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to create share" }, { status: 500 });
  }
}
