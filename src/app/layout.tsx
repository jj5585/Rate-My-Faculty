import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import SkipLink from "@/components/SkipLink";
import BottomDock from "@/components/BottomDock";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

export const viewport: Viewport = {
  themeColor: "#030611",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "RateMyFaculty India — Campus Reviews",
  description: "Anonymous faculty reviews by verified students. Honest ratings on teaching clarity, approachability, grading fairness and more.",
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
    title: "RateMyFaculty India — Campus Reviews",
    description: "Rate your professors anonymously. Honest reviews by real students across engineering universities & national institutes.",
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
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9410534184843151"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col justify-start relative overflow-x-hidden selection:bg-blue-600 selection:text-white bg-[#030611] text-[#F2F2F7]">
        {/* Ambient Liquid Mesh Light Fields (iOS Depth Engine) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-[130px] transform-gpu" />
          <div className="absolute top-[18%] -right-28 w-[380px] h-[380px] rounded-full bg-indigo-500/22 blur-[140px] transform-gpu" />
          <div className="absolute top-[48%] -left-32 w-[360px] h-[360px] rounded-full bg-cyan-400/15 blur-[120px] transform-gpu" />
          <div className="absolute top-[72%] -right-16 w-[400px] h-[400px] rounded-full bg-purple-600/18 blur-[140px] transform-gpu" />
          <div className="absolute -bottom-24 left-1/4 w-[420px] h-[320px] rounded-full bg-blue-500/15 blur-[120px] transform-gpu" />
        </div>

        <SkipLink />
        <Providers>{children}</Providers>
        <BottomDock />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}