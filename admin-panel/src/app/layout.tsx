import type { Metadata } from "next";
import { StoreProvider } from "@/store/provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Panel — Dr. Ekta Narula Dental Care",
  description: "Admin dashboard for managing Dr. Ekta Narula Dental Care website.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
