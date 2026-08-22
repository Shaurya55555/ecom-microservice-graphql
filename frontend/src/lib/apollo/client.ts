import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "@/lib/auth";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:4000/",
});

const authLink = setContext((_, { headers }) => {
  const session = getSession();
  return {
    headers: {
      ...headers,
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
  };
});

export function makeApolloClient() {
  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
