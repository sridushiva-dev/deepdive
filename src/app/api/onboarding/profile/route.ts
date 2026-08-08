import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { birthDate, locale, safeMode, parentEmail } = await request.json();

    if (!birthDate) {
      return NextResponse.json({ error: "Birth date required" }, { status: 400 });
    }

    const birth = new Date(birthDate);
    const age = calculateAge(birth);

    let parentalConsentStatus: "NOT_REQUIRED" | "PENDING" | "VERIFIED" = "NOT_REQUIRED";
    let safeModeEnabled = safeMode ?? false;

    if (age < 13) {
      if (!parentEmail) {
        return NextResponse.json({ error: "Parent email required for users under 13" }, { status: 400 });
      }
      parentalConsentStatus = "PENDING";
      safeModeEnabled = true;
    } else if (age < 18) {
      safeModeEnabled = safeMode ?? true;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        birthDate: birth,
        locale: locale ?? "en",
        safeMode: safeModeEnabled,
        parentEmail: parentEmail ?? null,
        parentalConsentStatus,
        onboardingStep: "PROFILE_COMPLETE",
      },
    });

    return NextResponse.json({ success: true, onboardingStep: "PROFILE_COMPLETE" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    await prisma.user.update({
      where: { id: user.id },
      data: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
