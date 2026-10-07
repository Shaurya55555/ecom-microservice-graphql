import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md animate-fade-in py-4 sm:py-10">
      <div className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <ShoppingBag className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
        </div>
      </div>
      <h1 className="text-center text-2xl font-semibold tracking-tight text-fg">{title}</h1>
      <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
      <Card className="mt-7 p-6 sm:p-7">{children}</Card>
      <p className="mt-6 text-center text-sm text-muted">{footer}</p>
    </div>
  );
}
