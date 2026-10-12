"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { LANDING_PAGE, type Role, type Session } from "@/lib/auth";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Client-side route guard. The real enforcement is on the services (JWT +
 * role checks); this just keeps people from landing on screens that can't work for them.
 */
export function RequireRole({
  roles,
  children,
  what = "this page",
}: {
  roles: Role[];
  what?: string;
  children: (session: Session) => React.ReactNode;
}) {
  const { session, ready } = useSession();

  if (!ready) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        icon={Lock}
        title="Please log in"
        description={`You need an account to view ${what}.`}
        action={
          <div className="flex gap-2">
            <Link href="/login" className={buttonStyles({})}>
              Log in
            </Link>
            <Link href="/signup" className={buttonStyles({ variant: "secondary" })}>
              Sign up
            </Link>
          </div>
        }
      />
    );
  }

  if (!roles.includes(session.role)) {
    return (
      <EmptyState
        icon={Lock}
        title="Not available for your account"
        description={`${what[0].toUpperCase()}${what.slice(1)} is for ${roles.join(" / ")} accounts. You're signed in as a ${session.role}.`}
        action={
          <Link href={LANDING_PAGE[session.role]} className={buttonStyles({ variant: "secondary" })}>
            Go to your dashboard
          </Link>
        }
      />
    );
  }

  return <>{children(session)}</>;
}
