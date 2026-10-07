"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ApolloWrapper } from "@/lib/apollo/provider";
import { ReduxWrapper } from "@/lib/redux/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReduxWrapper>
        <ApolloWrapper>
          {children}
          <Toaster position="bottom-right" richColors closeButton theme="system" />
        </ApolloWrapper>
      </ReduxWrapper>
    </ThemeProvider>
  );
}
