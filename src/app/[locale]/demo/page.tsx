import { Navbar } from "@/components/layout/navbar";
import { PublicDemoExperience } from "@/components/landing/public-demo";

export default function DemoPage() {
  return (
    <div className="min-h-screen starfield">
      <Navbar />
      <main className="pt-28 lg:pt-32 px-6 lg:px-10 pb-24 max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">
            Free interactive preview
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            See how Deep Dive works
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            Click concepts on the map, read every branch, and chat to go deeper.
            No sign-up, no payment — explore the full preview freely.
          </p>
        </div>
        <PublicDemoExperience />
      </main>
    </div>
  );
}
