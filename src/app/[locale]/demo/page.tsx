import { Navbar } from "@/components/layout/navbar";
import { PublicDemoExperience } from "@/components/landing/public-demo";

export default function DemoPage() {
  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 px-6 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-3">
            Interactive preview
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">See how Deep Dive works</h1>
          <p className="text-muted max-w-xl mx-auto">
            Click nodes on the constellation, chat to explore, and watch your map grow.
            No sign-up required to try this preview.
          </p>
        </div>
        <PublicDemoExperience />
      </main>
    </div>
  );
}
