import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaVriksh - Blue Carbon Ecosystem Initiative",
  description: "The International Blue Carbon Initiative is a coordinated, global program focused on conserving and restoring coastal ecosystems for the climate, biodiversity and human wellbeing.",
  keywords: "blue carbon, coastal ecosystems, climate change, mangroves, seagrasses, tidal marshes, carbon sequestration",
  authors: [{ name: "AquaVriksh Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
