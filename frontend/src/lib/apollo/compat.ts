import { ApolloLink } from "@apollo/client";
import { visit, type DocumentNode } from "graphql";
import { catchError, mergeMap, of, throwError } from "rxjs";

/**
 * Backward compatibility with older gateways.
 *
 * The product `category`, `imageUrl` and `createdAt` fields were added to the
 * gateway after this frontend first shipped. If the frontend is deployed
 * before the gateway it talks to, every query selecting them would fail GraphQL
 * validation and the whole catalog would go blank.
 *
 * This link notices that specific failure once, strips the unknown fields (and
 * the matching mutation arguments/variables) from the operation, and retries.
 * From then on every operation is stripped up front, so there is at most one
 * wasted round trip per page load. Against an up-to-date gateway it never fires.
 *
 * A validation failure means the server executed nothing, so retrying a
 * mutation is safe.
 */
const OPTIONAL_NAMES = ["category", "imageUrl", "createdAt"];
const OPTIONAL = new Set(OPTIONAL_NAMES);

// Quotes are JSON-escaped (\") when the message is read out of a serialised body, hence the optional backslashes.
const NAMES = OPTIONAL_NAMES.join("|");
const UNSUPPORTED = new RegExp(
  `Cannot query field \\\\?"(${NAMES})\\\\?"|Unknown argument \\\\?"(${NAMES})\\\\?"`
);

// Remembered per browser session so a legacy gateway costs one failed request, not one per page load.
// sessionStorage (not localStorage) means an upgraded gateway is picked up as soon as the tab is reopened.
const SESSION_KEY = "ecom_legacy_gateway";

function readFlag() {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

let legacyGateway = readFlag();

function markLegacy() {
  legacyGateway = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Storage blocked: fall back to detecting again on the next page load.
  }
}

/** Test hook. */
export function resetCompat() {
  legacyGateway = false;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isLegacyGateway() {
  return legacyGateway;
}

export function stripOptionalFields(doc: DocumentNode): DocumentNode {
  return visit(doc, {
    Field: (node) => (OPTIONAL.has(node.name.value) ? null : undefined),
    Argument: (node) => (OPTIONAL.has(node.name.value) ? null : undefined),
    VariableDefinition: (node) => (OPTIONAL.has(node.variable.name.value) ? null : undefined),
  });
}

/** True if a result or thrown link error is the "gateway doesn't know these fields" validation failure. */
export function isUnsupportedFieldFailure(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as { errors?: unknown; bodyText?: unknown; message?: unknown };
  // Validation errors arrive either as a 200 result with `errors`, or as a 400 ServerError whose bodyText holds the JSON.
  const haystack = [
    v.errors ? JSON.stringify(v.errors) : "",
    typeof v.bodyText === "string" ? v.bodyText : "",
    typeof v.message === "string" ? v.message : "",
  ].join(" ");
  return UNSUPPORTED.test(haystack);
}

export const compatLink = new ApolloLink((operation, forward) => {
  if (legacyGateway) operation.query = stripOptionalFields(operation.query);

  const retryStripped = () => {
    markLegacy();
    operation.query = stripOptionalFields(operation.query);
    return forward(operation);
  };

  return forward(operation).pipe(
    mergeMap((result) =>
      !legacyGateway && isUnsupportedFieldFailure(result) ? retryStripped() : of(result)
    ),
    catchError((error) =>
      !legacyGateway && isUnsupportedFieldFailure(error) ? retryStripped() : throwError(() => error)
    )
  );
});
