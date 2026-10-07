import {
  Shirt,
  Laptop,
  Home,
  Dumbbell,
  BookOpen,
  Sparkles,
  Gamepad2,
  Package,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  name: string;
  icon: LucideIcon;
  /** Tailwind gradient stops used for placeholder artwork and tiles. */
  gradient: string;
};

export const CATEGORIES: Category[] = [
  { name: "Electronics", icon: Laptop, gradient: "from-sky-500/25 via-indigo-500/15 to-transparent" },
  { name: "Fashion", icon: Shirt, gradient: "from-rose-500/25 via-pink-500/15 to-transparent" },
  { name: "Home", icon: Home, gradient: "from-amber-500/25 via-orange-500/15 to-transparent" },
  { name: "Sports", icon: Dumbbell, gradient: "from-emerald-500/25 via-teal-500/15 to-transparent" },
  { name: "Books", icon: BookOpen, gradient: "from-violet-500/25 via-purple-500/15 to-transparent" },
  { name: "Beauty", icon: Sparkles, gradient: "from-fuchsia-500/25 via-rose-500/15 to-transparent" },
  { name: "Toys & Games", icon: Gamepad2, gradient: "from-cyan-500/25 via-blue-500/15 to-transparent" },
  { name: "General", icon: Package, gradient: "from-zinc-500/25 via-slate-500/15 to-transparent" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

const FALLBACK = CATEGORIES[CATEGORIES.length - 1];

export function getCategory(name?: string | null): Category {
  return CATEGORIES.find((c) => c.name.toLowerCase() === (name ?? "").toLowerCase()) ?? FALLBACK;
}
