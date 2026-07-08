import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

const BASE = "https://www.eromify.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  alternates: {
    canonical: BASE,
  },
  // ── Keyword-rich title matching what Google expects for brand searches ──
  title: {
    default: "Eromify — AI Influencer Generator | Create AI Models, Images & Videos",
    template: "%s | Eromify",
  },
  description:
    "Eromify is the #1 AI Influencer Generator. Create photorealistic AI models, cinematic AI videos, and consistent virtual influencers in seconds. No limits. No watermarks. Start free.",
  keywords:
    "Eromify, AI influencer generator, create AI influencer, AI model generator, virtual influencer creator, AI image generation, AI video generation, AI media platform, AI UGC generator, consistent AI character, digital avatar creator, AI content creation, Akash Rana",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Eromify — AI Influencer Generator | Create AI Models, Images & Videos",
    description:
      "Create photorealistic AI influencers, cinematic videos, and premium AI images in seconds. The all-in-one AI media platform for creators and brands.",
    siteName: "Eromify",
    type: "website",
    url: BASE,
    images: [{ url: `${BASE}/eromifylogo.png`, width: 512, height: 512, alt: "Eromify — AI Influencer Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eromify — AI Influencer Generator | Create AI Models & Videos",
    description:
      "Create photorealistic AI influencers, cinematic videos, and premium AI content in seconds. Start free on Eromify.",
    images: [`${BASE}/eromifylogo.png`],
  },
};

// ── Structured data injected on EVERY page via layout ───────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Eromify",
  url: BASE,
  logo: {
    "@type": "ImageObject",
    url: `${BASE}/eromifylogo.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://www.instagram.com/eromify",
    "https://twitter.com/eromify",
  ],
  description:
    "Eromify is the leading AI influencer generation platform for creators and brands. Create photorealistic virtual influencers, AI videos, and digital media at scale.",
  foundingDate: "2025",
  founder: {
    "@type": "Person",
    name: "Akash Rana",
    url: "https://www.linkedin.com/in/akash-rana-24478421b/",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE}/about`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  name: "Eromify",
  url: BASE,
  description: "AI Influencer Generator — Create AI Models, Images & Videos",
  publisher: { "@id": `${BASE}/#organization` },
  // Enables Google Sitelinks Search Box
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/tools/creator?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// Sitelinks navigation — tells Google which pages are most important
const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Eromify Navigation",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Influencer Generator", url: `${BASE}/tools/creator` },
    { "@type": "ListItem", position: 2, name: "AI Influencer Studio", url: `${BASE}/ai-influencer-studio` },
    { "@type": "ListItem", position: 3, name: "Pricing", url: `${BASE}/pricing` },
    { "@type": "ListItem", position: 4, name: "About", url: `${BASE}/about` },
    { "@type": "ListItem", position: 5, name: "Blog", url: `${BASE}/blog` },
  ],
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Eromify",
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "AI Content Generation",
  operatingSystem: "Web browser, OS agnostic",
  url: BASE,
  description: "The #1 AI Influencer Generator. Create photorealistic AI models, cinematic AI videos, and consistent virtual influencers in seconds.",
  featureList: [
    "AI Influencer Generator",
    "AI Image Generator",
    "AI Video Generator",
    "AI Avatar Generator"
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  creator: { "@id": `${BASE}/#organization` },
  publisher: { "@id": `${BASE}/#organization` },
  potentialAction: {
    "@type": "UseAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/tools/creator`
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4692600238249678"
          crossOrigin="anonymous"
        ></script>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KLT8K1QBQM"></script>
        <script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KLT8K1QBQM');
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Global structured data on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <SessionProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
