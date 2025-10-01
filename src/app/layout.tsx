import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WalletContextProvider } from "@/components/wallet-provider";
import { Header } from "@/components/header";

const shareTechMono = localFont({
  src: "../../public/fonts/ShareTechMono-Regular.ttf",
  variable: "--font-share-tech",
});

const abel = localFont({
  src: "../../public/fonts/Abel-Regular.ttf",
  variable: "--font-abel",
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
    <html lang="en" className="dark">
      <body
        className={`${abel.variable} ${shareTechMono.variable} antialiased h-screen overflow-hidden bg-[#0a0a0a] text-white flex flex-col`}
      >
        <WalletContextProvider>
          <Header />
          <main className="flex-1 overflow-hidden">{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
