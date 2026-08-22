"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { makeApolloClient } from "./client";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
