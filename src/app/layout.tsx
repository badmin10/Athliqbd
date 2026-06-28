import type { Metadata } from "next";
import { Archivo_Black, Oswald, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

// Archivo Black — bold condensed-caps display face for H1/H2 and the wordmark
const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

// Oswald — condensed face for nav links, buttons, eyebrows, table headers, prices
const oswald = Oswald({
  variable: "--font-meta",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Inter — clean, highly legible body face
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athliqbd | Badminton & Running Gear in Bangladesh",
  description:
    "Shop badminton racquets, strings, shuttlecocks, and running shoes and apparel in Bangladesh. Cash on delivery available nationwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${oswald.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-court-white text-ink"
        suppressHydrationWarning
      >
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
