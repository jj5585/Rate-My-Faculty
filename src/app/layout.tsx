import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "Rate My Faculty — SRMIST",
  description: "Anonymous faculty reviews by SRMIST students. Rate your professors on teaching, approachability, fairness and more.",
  manifest: "/manifest.json",
  verification: {
    google: "hmeISNjUVRQpT7myKlg6WLBg7_-Yn_Ij7CSl5QFaTXU",
  },
  other: {
    "google-adsense-account": "ca-pub-9410534184843151",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Rate My Faculty — SRMIST",
    description: "Rate your professors anonymously. Honest reviews by real students.",
    url: "https://rate-my-facult.me",
    siteName: "Rate My Faculty",
    images: [
      {
        url: "https://rate-my-facult.me/og-image.jpg",
        width: 1080,
        height: 1080,
        alt: "Rate My Faculty",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9410534184843151"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
        <footer style={{
          borderTop: "1px solid #1a1a1d",
          padding: "14px 24px",
          textAlign: "center" as const,
          backgroundColor: "#0a0a0a",
        }}>
          <p style={{
            fontSize: "10px",
            lineHeight: "1.6",
            color: "#3f3f46",
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            All content represents user opinions and experiences. We do not verify claims.{" "}
            Report inappropriate content for review.
          </p>
        </footer>
      </body>
    </html>
  );
}