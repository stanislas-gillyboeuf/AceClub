export default function AdherentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="marketing-theme min-h-screen bg-mkt-bg text-mkt-fg">{children}</div>
}
