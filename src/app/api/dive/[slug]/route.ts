import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const share = await prisma.share.findUnique({
    where: { slug },
    include: {
      session: {
        include: {
          nodes: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!share) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (share.visibility === "PRIVATE") {
    // Private shares still accessible via slug
  }

  return NextResponse.json({
    session: share.session,
    share: {
      slug: share.slug,
      visibility: share.visibility,
      createdAt: share.createdAt,
    },
  });
}
