import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo/provider";
import { ReduxWrapper } from "@/lib/redux/provider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecom Microservice GraphQL — Demo Store",
  description: "Frontend demo for the ecom-microservice-graphql project",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <ReduxWrapper>
          <ApolloWrapper>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
              {children}
            </main>
          </ApolloWrapper>
        </ReduxWrapper>
      </body>
    </html>
  );
}
