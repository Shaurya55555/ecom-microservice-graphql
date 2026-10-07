import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <p className="font-serif text-7xl leading-none text-brand" aria-hidden>
        404
      </p>
      <h1 className="mt-5 text-3xl font-medium tracking-tight text-fg">Page not found</h1>
      <p className="mt-3 text-sm text-muted">
        We couldn&apos;t find that page. It may have moved, or the link might be wrong.
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
