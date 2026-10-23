"use client";

import Header from "./Header";
import Footer from "./Footer";
import ScrollReveal from "./ScrollReveal";
import FloatingCTA from "../cta/FloatingCTA";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollReveal />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
