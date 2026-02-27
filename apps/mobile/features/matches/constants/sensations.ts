export const SENSATIONS = [
  { id: "bad", emoji: "\u{1F61E}", label: "Mauvaises" },
  { id: "average", emoji: "\u{1F610}", label: "Moyen" },
  { id: "good", emoji: "\u{1F642}", label: "Bon" },
  { id: "great", emoji: "\u{1F525}", label: "Très bon" },
] as const;

export const SENSATION_MAP: Record<string, { emoji: string; label: string }> =
  Object.fromEntries(SENSATIONS.map((s) => [s.id, { emoji: s.emoji, label: s.label }]));
