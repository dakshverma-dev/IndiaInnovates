import Navbar from "./components/landing/Navbar";
import HeroSection from "./components/landing/HeroSection";
import CredibilityBar from "./components/landing/CredibilityBar";
import ProblemSection from "./components/landing/ProblemSection";
import ThreeEnginesSection from "./components/landing/ThreeEnginesSection";
import DataFlowSection from "./components/landing/DataFlowSection";
import PillarsSection from "./components/landing/PillarsSection";
import CivicHealthSection from "./components/landing/CivicHealthSection";
import TechStackSection from "./components/landing/TechStackSection";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <CredibilityBar />
      <ProblemSection />
      <ThreeEnginesSection />
      <DataFlowSection />
      <PillarsSection />
      <CivicHealthSection />
      <TechStackSection />
      <Footer />
    </>
  );
}
