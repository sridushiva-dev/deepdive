import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const maps = await prisma.curatedMap.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ maps });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const map = await prisma.curatedMap.create({
      data: {
        title: body.title,
        titleHi: body.titleHi,
        description: body.description,
        descriptionHi: body.descriptionHi,
        treeJson: body.treeJson,
        estimatedMinutes: body.estimatedMinutes ?? 60,
        published: body.published ?? false,
      },
    });

    return NextResponse.json({ map });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create map" }, { status: 500 });
  }
}
