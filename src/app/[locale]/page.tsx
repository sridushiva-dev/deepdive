"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { LandingConstellationPreview } from "@/components/landing/constellation-preview";
import { ArrowRight, Key, Map, Share2, MessageSquare, Sparkles } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  const features = [
    {
      icon: Key,
      title: t("feature1Title"),
      desc: t("feature1Desc"),
    },
    {
      icon: Map,
      title: t("feature2Title"),
      desc: t("feature2Desc"),
    },
    {
      icon: Share2,
      title: t("feature3Title"),
      desc: t("feature3Desc"),
    },
  ];

  const steps = [
    {
      icon: MessageSquare,
      title: "Ask what you want to learn",
      desc: "Type a topic or pick a curated map. The ocean of knowledge has no bottom.",
    },
    {
      icon: Sparkles,
      title: "Dive deeper with AI",
      desc: "Chat to explore. Each new concept becomes a node in your constellation.",
    },
    {
      icon: Share2,
      title: "Share your depth",
      desc: "Publish your map — show how many levels deep you've gone.",
    },
  ];

  return (
    <div className="min-h-screen starfield">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-6">
              {tc("tagline")}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              {t("hero")}
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("subhero")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  {t("cta")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("ctaSecondary")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Constellation preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20"
          >
            <div className="glass rounded-3xl p-8 md:p-12 border border-border/50">
              <LandingConstellationPreview />
              <p className="text-sm text-muted mt-6">
                Your constellation grows with every dive
              </p>
            </div>
          </motion.div>
        </div>

        {/* How it works — public, no login */}
        <section id="how-it-works" className="max-w-5xl mx-auto mt-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted max-w-lg mx-auto">
              Three steps from curiosity to a shareable map of everything you&apos;ve explored.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="glass rounded-2xl p-6 border border-border/50 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/demo">
              <Button size="lg">
                Try the interactive demo — no sign-up
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass rounded-2xl p-6 border border-border/50"
            >
              <feature.icon className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
