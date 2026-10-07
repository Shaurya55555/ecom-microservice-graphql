"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ApolloWrapper } from "@/lib/apollo/provider";
import { ReduxWrapper } from "@/lib/redux/provider";
import { CartDrawer } from "@/components/cart/CartDrawer";

// Sonner reads these CSS variables, so toasts follow the page palette in both themes.
const TOAST_VARS = {
  "--normal-bg": "var(--surface)",
  "--normal-text": "var(--fg)",
  "--normal-border": "var(--line-strong)",
  "--success-bg": "var(--surface)",
  "--success-text": "var(--fg)",
  "--success-border": "var(--line-strong)",
  "--error-bg": "var(--surface)",
  "--error-text": "var(--danger)",
  "--error-border": "var(--danger)",
  "--border-radius": "8px",
} as React.CSSProperties;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReduxWrapper>
        <ApolloWrapper>
          {children}
          <CartDrawer />
          <Toaster position="bottom-center" closeButton style={TOAST_VARS} />
        </ApolloWrapper>
      </ReduxWrapper>
    </ThemeProvider>
  );
}
