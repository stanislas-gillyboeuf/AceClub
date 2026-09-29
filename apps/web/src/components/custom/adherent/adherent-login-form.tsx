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
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Espace adhérent</CardTitle>
        <CardDescription>Connectez-vous avec le compte utilisé sur l&apos;app {clubName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="adherent-email">Email</Label>
              <Input
                id="adherent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adherent-password">Mot de passe</Label>
              <Input
                id="adherent-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
