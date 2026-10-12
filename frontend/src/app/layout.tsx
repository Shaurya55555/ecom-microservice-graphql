import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ecom-microservice-graphql.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "Ecom.store",
    title: "Ecom.store - Shop, sell and ship",
    description:
      "Microservice e-commerce platform with a GraphQL gateway, Kafka and Docker.",
  },
  twitter: { card: "summary_large_image" },
  title: {
    default: "Ecom.store — Shop, sell and ship",
    template: "%s · Ecom.store",
  },
  description:
    "A small marketplace where independent sellers list what they make and buyers order directly from them.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4eee3" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1713" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
