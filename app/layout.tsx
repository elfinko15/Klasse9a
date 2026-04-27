import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Auf Wiedersehen 💫 – Wir vermissen euch!",
  description: "Eine Kommentarseite zum Abschied unserer Mitschüler.",
  openGraph: {
    title: "Auf Wiedersehen 💫 – Wir vermissen euch!",
    description: "Hinterlasse einen Kommentar für unsere scheidenden Mitschüler.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
