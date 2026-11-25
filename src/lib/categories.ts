export const CATEGORIES = [
  { code: "DAYCARE", label: "유치원", emoji: "🏠" },
  { code: "HOTEL", label: "호텔", emoji: "🛏️" },
  { code: "GROOMING", label: "미용", emoji: "✂️" },
  { code: "VET", label: "애견병원", emoji: "🏥" },
] as const;

export type CategoryCode = (typeof CATEGORIES)[number]["code"];

export function parseCategories(categories: string): CategoryCode[] {
  return categories
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean) as CategoryCode[];
}

export function categoryLabel(code: string) {
  return CATEGORIES.find((c) => c.code === code)?.label ?? code;
}

const badgeStyle: Record<string, string> = {
  GROOMING: "bg-brand-50 text-brand-600",
  HOTEL: "bg-purple-400/10 text-purple-600",
  DAYCARE: "bg-amber-500/10 text-amber-600",
  VET: "bg-mint-500/10 text-mint-500",
};

export function categoryBadgeStyle(code: string) {
  return badgeStyle[code] ?? "bg-ink-100 text-ink-500";
}
