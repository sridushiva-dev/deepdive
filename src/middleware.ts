import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/request";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/dive",
  "/api/auth",
];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function stripLocale(pathname: string) {
  const match = pathname.match(/^\/(en|hi)(\/|$)/);
  if (match) {
    return pathname.slice(match[1].length + 1) || "/";
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathWithoutLocale = stripLocale(pathname);

  if (!token && !isPublicPath(pathWithoutLocale)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathWithoutLocale === "/login" || pathWithoutLocale === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    token &&
    pathWithoutLocale !== "/onboarding" &&
    pathWithoutLocale !== "/welcome" &&
    !pathWithoutLocale.startsWith("/session") &&
    !pathWithoutLocale.startsWith("/dive")
  ) {
    const onboardingStep = token.onboardingStep as string;
    const welcomeSeen = token.welcomeSeen as boolean;

    if (
      onboardingStep === "SIGNED_UP" ||
      onboardingStep === "PROFILE_COMPLETE" ||
      (onboardingStep !== "COMPLETE" &&
        onboardingStep !== "KEY_VERIFIED" &&
        onboardingStep !== "DEMO_COMPLETE" &&
        onboardingStep !== "WELCOME_SEEN")
    ) {
      if (pathWithoutLocale !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    } else if (
      (onboardingStep === "KEY_VERIFIED" ||
        onboardingStep === "DEMO_COMPLETE") &&
      !welcomeSeen &&
      pathWithoutLocale !== "/welcome"
    ) {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
