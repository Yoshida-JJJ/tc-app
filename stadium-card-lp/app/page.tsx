import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HeatTrade } from "@/components/HeatTrade";
import { MemorialTag } from "@/components/MemorialTag";
import { UserStory } from "@/components/UserStory";
import { FutureVision } from "@/components/FutureVision";
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-stadium-black text-white selection:bg-neon-blue selection:text-black">
            <Navbar />
            <Hero />
            <HeatTrade />
            <MemorialTag />
            <UserStory />
            <FutureVision />
            <Footer />
        </main>
    );
}
