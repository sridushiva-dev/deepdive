"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Share2, Check, MessageCircle } from "lucide-react";

interface ShareModalProps {
  sessionId: string;
  sessionTitle: string;
  stats: { nodeCount: number; depthMax: number; minutes: number };
  onClose: () => void;
  onFirstShare?: () => void;
}

export function ShareModal({
  sessionId,
  sessionTitle,
  stats,
  onClose,
  onFirstShare,
}: ShareModalProps) {
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const url = `${window.location.origin}/dive/${data.slug}`;
      setShareUrl(url);
      onFirstShare?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!shareUrl) return;
    const text = `I dove ${stats.depthMax} levels deep into "${sessionTitle}" on Deep Dive — ${stats.nodeCount} concepts explored! ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function downloadImage() {
    window.open(`/api/sessions/${sessionId}/share-image?visibility=${visibility}`, "_blank");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-3xl p-8 max-w-md w-full border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-semibold">Share your dive</h2>
          </div>

          {/* Preview card */}
          <div className="rounded-2xl bg-gradient-to-br from-surface-elevated to-background border border-border p-6 mb-6 starfield">
            <p className="text-xs text-accent mb-2">Deep Dive</p>
            <h3 className="text-lg font-semibold mb-4">{sessionTitle}</h3>
            <div className="flex gap-4 text-sm text-muted">
              <span>{stats.nodeCount} concepts</span>
              <span>{stats.depthMax} levels deep</span>
              <span>{stats.minutes} min</span>
            </div>
            <div className="mt-4 flex gap-2">
              {[...Array(Math.min(stats.nodeCount, 8))].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent/60"
                  style={{ opacity: 0.4 + (i / 8) * 0.6 }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={visibility === "PUBLIC" ? "default" : "outline"}
              size="sm"
              onClick={() => setVisibility("PUBLIC")}
              className="flex-1"
            >
              Public
            </Button>
            <Button
              variant={visibility === "PRIVATE" ? "default" : "outline"}
              size="sm"
              onClick={() => setVisibility("PRIVATE")}
              className="flex-1"
            >
              Private link
            </Button>
          </div>

          {!shareUrl ? (
            <Button onClick={createShare} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Generate share link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="text-xs"
                />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={downloadImage}>
                  <Download className="w-4 h-4" />
                  Image
                </Button>
                <Button variant="outline" className="flex-1" onClick={shareWhatsApp}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}

          <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
            Close
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
