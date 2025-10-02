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
  title: "SnapLP",
  description:
    "Simplified DLMM liquidity provision - a strategy templates marketplace",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "SnapLP - DLMM Strategy Templates",
    description: "Simplified DLMM liquidity provision with pre-configured strategy templates",
    url: "https://snaplp.vercel.app",
    siteName: "SnapLP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapLP - DLMM Strategy Templates",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapLP - DLMM Strategy Templates",
    description: "Simplified DLMM liquidity provision with pre-configured strategy templates",
    images: ["/og-image.png"],
  },
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
