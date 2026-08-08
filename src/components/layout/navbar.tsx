"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full bg-accent/20 glow-accent" />
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-accent" />
        <div className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-accent-deep" />
        <div className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-foreground/60" />
      </div>
      <span className="font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">
        Deep Dive
      </span>
    </Link>
  );
}

export function Navbar({ showAuth = true }: { showAuth?: boolean }) {
  const pathname = usePathname();
  const isApp = pathname?.includes("/dashboard") || pathname?.includes("/dive");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        {showAuth && (
          <nav className="flex items-center gap-3">
            {isApp ? (
              <>
                <Link href="/explore">
                  <Button variant="ghost" size="sm">Explore</Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm">Settings</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
