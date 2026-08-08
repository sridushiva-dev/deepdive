"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Key, Map, Share2 } from "lucide-react";

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
              <Link href="/explore">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Constellation preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-8 md:p-12 border border-border/50">
              <div className="flex items-center justify-center gap-8 min-h-[200px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-accent/20 glow-accent flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-accent" />
                  </div>
                  <div className="absolute top-8 left-20 w-32 h-[2px] bg-accent/30 rotate-12" />
                  <div className="absolute top-16 left-28 w-10 h-10 rounded-full bg-accent-deep/20 border border-accent-deep/40" />
                  <div className="absolute -top-4 left-24 w-8 h-8 rounded-full bg-accent/30 border border-accent/50" />
                  <div className="absolute top-12 -left-16 w-12 h-12 rounded-full bg-surface-elevated border border-border" />
                  <div className="absolute -top-8 left-8 w-6 h-6 rounded-full bg-accent/40" />
                </div>
              </div>
              <p className="text-sm text-muted mt-6">
                Your constellation grows with every dive
              </p>
            </div>
          </motion.div>
        </div>

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
