import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import RocketAnimation from "@/components/RocketAnimation";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Klasse 9a",
  description: "Die Kommentarseite der Klasse 9a.",
  openGraph: {
    title: "Klasse 9a",
    description: "Hinterlasse eine Nachricht für deine Mitschüler.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-screen">
        <RocketAnimation />
        {children}
      </body>
    </html>
  );
}
