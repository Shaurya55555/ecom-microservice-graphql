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
      <h1 className="text-3xl font-medium tracking-tight text-fg">{title}</h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <Card className="mt-7 p-6 sm:p-7">{children}</Card>
      <p className="mt-6 text-sm text-muted">{footer}</p>
    </div>
  );
}
