"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"

interface AdherentLoginFormProps {
  clubName: string
  /** Called after a successful sign-in — the page just re-renders with the session, no redirect. */
  onSignedIn: () => void
}

export function AdherentLoginForm({ clubName, onSignedIn }: AdherentLoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message || "Email ou mot de passe incorrect")
        setIsLoading(false)
        return
      }
      onSignedIn()
    } catch {
      setError("Une erreur est survenue. Réessayez.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm rounded-3xl border-adh-border bg-adh-card shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-extrabold text-adh-fg">Connexion adhérent</CardTitle>
        <CardDescription className="text-adh-fg-dim">
          Utilisez le compte de l&apos;app {clubName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && (
              <div className="rounded-xl bg-adh-danger/10 p-3 text-sm text-adh-danger">{error}</div>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="adherent-email" className="text-xs font-bold uppercase tracking-wide text-adh-fg-dim">
                Email
              </Label>
              <Input
                id="adherent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-12 rounded-2xl border-adh-border bg-adh-bg px-4 text-adh-fg placeholder:text-adh-fg-faint focus-visible:ring-adh-accent-dim"
              />
            </div>
            <div className="grid gap-1.5">
              <Label
                htmlFor="adherent-password"
                className="text-xs font-bold uppercase tracking-wide text-adh-fg-dim"
              >
                Mot de passe
              </Label>
              <Input
                id="adherent-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-12 rounded-2xl border-adh-border bg-adh-bg px-4 text-adh-fg placeholder:text-adh-fg-faint focus-visible:ring-adh-accent-dim"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-full bg-adh-accent text-sm font-bold text-adh-accent-foreground hover:bg-adh-accent/90"
            >
              {isLoading ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              Se connecter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
