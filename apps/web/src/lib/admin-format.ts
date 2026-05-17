const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-"
  return dateFormatter.format(new Date(dateStr))
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-"
  return dateTimeFormatter.format(new Date(dateStr))
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
