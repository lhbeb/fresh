import type { Metadata } from "next";
import "./globals.css";
import ClientHeader from "@/components/ClientHeader";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";
import InstagramSection from "@/components/InstagramSection";
import ErrorBoundaryWrapper from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";
import { Suspense } from "react";
import VisitNotifier from "@/components/VisitNotifier";
import { AdminRouteCheck, PublicRouteOnly, AdminRouteOnly, CheckoutRouteOnly } from "@/components/AdminRouteCheck";

export const metadata: Metadata = {
  title: "HappyDeel - Everything You Want, One Marketplace.",
  description: "Shop millions of products at HappyDeel: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
  keywords: "HappyDeel, online marketplace, general store, electronics, fashion, home, collectibles, toys, beauty, gadgets, deals, shopping, eBay alternative, secure checkout, fast shipping",
  authors: [{ name: "HappyDeel" }],
  creator: "HappyDeel",
  publisher: "HappyDeel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://happydeel.com"),
  openGraph: {
    title: "HappyDeel - Everything You Want, One Marketplace.",
    description: "Shop millions of products at HappyDeel: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
    url: "https://happydeel.com",
    siteName: "HappyDeel",
    images: [
      {
        url: "/g7x.webp",
        width: 1200,
        height: 630,
        alt: "HappyDeel - Online Marketplace for Everything",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HappyDeel - Everything You Want, One Marketplace.",
    description: "Shop millions of products at HappyDeel: electronics, fashion, home, collectibles, toys, beauty, gadgets, and more. Discover unbeatable deals, fast shipping, and a secure shopping experience—just like eBay, but happier!",
    images: ["/g7x.webp"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preload" href="/logosvg.svg" as="image" type="image/svg+xml" />
      </head>
      <body suppressHydrationWarning>
        <PublicRouteOnly>
          <VisitNotifier />
        </PublicRouteOnly>
        {/* Organization Schema */}
        <AdminRouteCheck>
          <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "HappyDeel",
                "url": "https://happydeel.com",
                "logo": "https://happydeel.com/logosvg.svg",
                "description": "HappyDeel - Where Savings Make You Smile. Discover premium cameras and photography equipment at unbeatable prices.",
                "sameAs": [
                  "https://twitter.com/happydeel",
                  "https://facebook.com/happydeel",
                  "https://instagram.com/happydeel"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "email": "support@happydeel.com"
                },
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "1420 N McKinley Ave",
                  "addressLocality": "Los Angeles",
                  "addressRegion": "CA",
                  "postalCode": "90059",
                  "addressCountry": "US"
                }
              })
            }}
          />
        </AdminRouteCheck>
        
        {/* WebSite Schema */}
        <AdminRouteCheck>
          <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "HappyDeel",
                "url": "https://happydeel.com",
                "description": "HappyDeel - Where Savings Make You Smile. Discover premium cameras and photography equipment at unbeatable prices.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://happydeel.com/api/products/search?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </AdminRouteCheck>
        
        <ErrorBoundaryWrapper>
          {/* Public website with header, footer, etc. */}
          <PublicRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
              <InstagramSection />
              <NewsletterSection />
              <Footer />
            </div>
            <CookieConsent />
          </PublicRouteOnly>
          
          {/* Checkout page - navbar only, no distractions */}
          <CheckoutRouteOnly>
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={null}>
                <ClientHeader />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </CheckoutRouteOnly>
          
          {/* Admin dashboard - clean, no public UI */}
          <AdminRouteOnly>
            {children}
          </AdminRouteOnly>
        </ErrorBoundaryWrapper>
        
        {/* Tidio Live Chat Widget */}
        <AdminRouteCheck>
          <Script
            src="//code.tidio.co/lao55328vrfjvxo5bowtsetve5jhdksf.js"
            async
          />
        </AdminRouteCheck>
        <AdminRouteCheck>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-820YBJWJCY"
            strategy="afterInteractive"
            async
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-820YBJWJCY');
              `,
            }}
          />
        </AdminRouteCheck>
        {/* Google Ads Conversion Tracking */}
        <AdminRouteCheck>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17682444096"
            strategy="afterInteractive"
            async
          />
          <Script
            id="google-ads-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17682444096');
              `,
            }}
          />
        </AdminRouteCheck>
      </body>
    </html>
  );
}
