import { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Gimme Idea | Share your idea and feedback to earn",
  description:
    "Share your startup ideas, get community feedback, and receive crypto tips. Built on Solana blockchain.",
  keywords: [
    "startup ideas",
    "solana",
    "crypto",
    "blockchain",
    "community feedback",
    "idea validation",
  ],
  authors: [{ name: "DUT Superteam University Club" }],
  creator: "DUT Superteam University Club",
  metadataBase: new URL("https://gimmeidea.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://gimmeidea.com",
    title: "Gimme Idea | Share & Validate Startup Ideas",
    description:
      "Share your startup ideas, get community feedback, and receive crypto tips on Solana.",
    siteName: "Gimme Idea",
    images: [
      {
        url: "/OG-img.png",
        width: 1200,
        height: 630,
        alt: "Gimme Idea - Share & Validate Startup Ideas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gimme Idea | Share & Validate Startup Ideas",
    description:
      "Share your startup ideas, get community feedback, and receive crypto tips on Solana.",
    images: ["/OG-img.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
