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
  /** Flat background tone (a Tailwind class backed by a theme token) for artwork and tiles. */
  tone: string;
};

export const CATEGORIES: Category[] = [
  { name: "Electronics", icon: Laptop, tone: "bg-tone-sky" },
  { name: "Fashion", icon: Shirt, tone: "bg-tone-rose" },
  { name: "Home", icon: Home, tone: "bg-tone-ochre" },
  { name: "Sports", icon: Dumbbell, tone: "bg-tone-sage" },
  { name: "Books", icon: BookOpen, tone: "bg-tone-dusk" },
  { name: "Beauty", icon: Sparkles, tone: "bg-tone-clay" },
  { name: "Toys & Games", icon: Gamepad2, tone: "bg-tone-sand" },
  { name: "General", icon: Package, tone: "bg-tone-stone" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

const FALLBACK = CATEGORIES[CATEGORIES.length - 1];

export function getCategory(name?: string | null): Category {
  return CATEGORIES.find((c) => c.name.toLowerCase() === (name ?? "").toLowerCase()) ?? FALLBACK;
}
