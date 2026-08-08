"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    async function markWelcome() {
      await fetch("/api/onboarding/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          welcomeSeen: true,
          onboardingStep: "COMPLETE",
        }),
      });
      await update({ welcomeSeen: true, onboardingStep: "COMPLETE" });
    }
    markWelcome();
  }, [update]);

  return (
    <div className="min-h-screen flex items-center justify-center starfield">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/20 glow-accent flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          {t("welcomeTitle")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="text-lg text-muted mb-10"
        >
          {t("welcomeSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <Button size="lg" onClick={() => router.push("/dashboard")}>
            Enter the ocean
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
