import type { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      onboardingStep: string;
      welcomeSeen: boolean;
    };
  }

  interface User {
    role?: UserRole;
    onboardingStep?: string;
    welcomeSeen?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    onboardingStep?: string;
    welcomeSeen?: boolean;
  }
}
