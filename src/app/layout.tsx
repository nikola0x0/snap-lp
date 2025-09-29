import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/wallet-provider";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapLP - DLMM Strategy Templates",
  description:
    "Simplified DLMM liquidity provision with pre-configured strategy templates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden bg-background flex flex-col`}
      >
        <WalletContextProvider>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
