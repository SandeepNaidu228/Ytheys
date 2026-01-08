import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

// 🟢 REBRANDED METADATA
export const metadata: Metadata = {
  title: "Ytheys - Find the Right Agency for Your Project | Expert Service Matching",
  description:
    "Ytheys helps you discover the perfect agency for your next project in seconds. Browse expert services, compare ratings, and find top companies across various domains, not GitHub repositories.",
  keywords:
    "find agencies, expert service matching, project agency discovery, compare service agencies, find development agencies, web development agencies, AI project agencies, marketing service matching, top-rated agencies, Ytheys, service discovery platform, project matching tool, best service providers, agency ratings, project management agencies, custom development, business service providers, domain expertise search, service provider directory",
  openGraph: {
    title: "Ytheys - Find the Right Agency for Your Project | Expert Service Matching",
    description:
      "Ytheys helps you discover the perfect agency for your next project in seconds. Browse expert services, compare ratings, and find top companies across various domains, not GitHub repositories.",
    url: "https://ytheys.com", // Assuming new domain
    siteName: "Ytheys",
    images: [
      {
        url: "https://ytheys.com/og.png", // Assuming new OG image
        width: 1200,
        height: 630,
        alt: "Ytheys - Find the right service agency for your project",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ytheys - Find the Right Agency for Your Project",
    description: "Ytheys helps you discover the perfect agency for your next project in seconds. Browse expert services, compare ratings, and find top companies.",
    images: ["https://ytheys.com/og.png"],
    creator: "@Ytheys", // Assuming new Twitter handle
    site: "@Ytheys" // Assuming new Twitter handle
  },
  other: {
    "twitter:image": "https://ytheys.com/og.png",
    "twitter:card": "summary_large_image",
    "twitter:url": "https://ytheys.com",
    "twitter:domain": "ytheys.com",
    "twitter:title": "Ytheys - Find the Right Agency for Your Project | Expert Service Matching",
    "twitter:description":
      "Ytheys helps you discover the perfect agency for your next project in seconds. Browse expert services, compare ratings, and find top companies.",
    "twitter:creator": "@Ytheys",
    "twitter:site": "@Ytheys",
    "og:url": "https://ytheys.com",
    "og:type": "website",
    "og:title": "Ytheys - Find the Right Agency for Your Project | Expert Service Matching",
    "og:description":
      "Ytheys helps you discover the perfect agency for your next project in seconds. Browse expert services, compare ratings, and find top companies.",
    "og:image": "https://ytheys.com/og.png",
    "og:site_name": "Ytheys",
    "og:locale": "en_US",
    // Schema.org structured data
    "application-name": "Ytheys",
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
    // Additional SEO meta tags
    "author": "Ytheys",
    "publisher": "Ytheys",
    "copyright": "Ytheys",
    "language": "English",
    "revisit-after": "1 day",
    "distribution": "global",
    "rating": "general",
    "robots": "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    // Geo targeting
    "geo.region": "IN",
    "geo.country": "India",
    // Mobile optimization
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Ytheys",
    // Alternative titles for different contexts
    "og:title:alt": "Agency Service Discovery | Project Matching | Ytheys",
    "twitter:title:alt": "Expert Agency Finder | Service Provider Tool",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Additional metadata for better SEO
  alternates: {
    canonical: "https://ytheys.com",
  },
  // App-specific metadata
  applicationName: "Ytheys",
  category: "Technology",
};

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-instrument-serif",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}