import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
        <Compass className="h-8 w-8" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-6 text-sm font-medium text-brand-text">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">Page not found</h1>
      <p className="mt-3 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={buttonStyles({})}>
          Back home
        </Link>
        <Link href="/products" className={buttonStyles({ variant: "secondary" })}>
          Browse products
        </Link>
      </div>
    </div>
  );
}
