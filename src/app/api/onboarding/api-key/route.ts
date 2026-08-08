import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { verifyApiKey } from "@/lib/ai-chat";
import type { ApiProvider } from "@prisma/client";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API key required" }, { status: 400 });
    }

    const valid = await verifyApiKey(provider as ApiProvider, apiKey);
    if (!valid) {
      return NextResponse.json({ error: "Could not verify API key. Check your key and try again." }, { status: 400 });
    }

    const { encrypted, iv } = encrypt(apiKey);

    await prisma.apiKey.upsert({
      where: {
        userId_provider: { userId: user.id, provider: provider as ApiProvider },
      },
      create: {
        userId: user.id,
        provider: provider as ApiProvider,
        encryptedKey: encrypted,
        iv,
        verifiedAt: new Date(),
      },
      update: {
        encryptedKey: encrypted,
        iv,
        verifiedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: "KEY_VERIFIED",
      },
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("API key error:", error);
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}
