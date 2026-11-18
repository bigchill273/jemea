import Navbar from "@/components/layout/Navbar";
import Hero from "./Hero";
import Feature from "./Feature";
import Pricing from "./Pricing";
import CallToAction from "./CallToAction";
import Footer from "@/components/layout/Footer";

export default function HomePagePartial() {
  return (
    <div className="min-h-screen bg-background text-foreground workspace-backdrop">
      <Navbar />
      <Hero />
      <Feature />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
}
