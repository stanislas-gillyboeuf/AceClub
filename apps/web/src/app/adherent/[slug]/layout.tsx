import { Providers } from "@/app/providers"

export default function AdherentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="adherent-theme min-h-screen bg-adh-bg text-adh-fg">{children}</div>
    </Providers>
  )
}
