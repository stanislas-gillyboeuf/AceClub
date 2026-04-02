export const SENSATIONS = [
  { id: "bad", emoji: "\u{1F61E}", label: "Mauvaises" },
  { id: "average", emoji: "\u{1F610}", label: "Moyen" },
  { id: "good", emoji: "\u{1F642}", label: "Bon" },
  { id: "great", emoji: "\u{1F525}", label: "Très bon" },
] as const;

export const SENSATION_MAP: Record<string, { emoji: string; label: string }> =
  Object.fromEntries(SENSATIONS.map((s) => [s.id, { emoji: s.emoji, label: s.label }]));

export const EFFORT_LEVELS = [
  { id: "bad", value: 1, label: "Léger", description: "Échauffement tranquille", percentage: "25%" },
  { id: "average", value: 2, label: "Modéré", description: "Bonne session d'entraînement", percentage: "50%" },
  { id: "good", value: 3, label: "Intense", description: "Tu as bien poussé tes limites", percentage: "75%" },
  { id: "great", value: 4, label: "Très intense", description: "Tu as tout donné sur le terrain", percentage: "100%" },
] as const;

export const EFFORT_MAP: Record<string, { label: string; description: string; percentage: string; value: number }> =
  Object.fromEntries(EFFORT_LEVELS.map((e) => [e.id, { label: e.label, description: e.description, percentage: e.percentage, value: e.value }]));
