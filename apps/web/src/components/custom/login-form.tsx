"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"

interface ActiveMemberRoleResponse {
  role: "owner" | "admin" | "coach" | "member"
  onboardingCompleted: boolean
}

/** Platform admin -> the super-admin panel; any club-level owner/admin/coach -> the club
 * dashboard (which itself routes a coach to their scoped view); neither -> no admin access. */
async function resolveDestination(role: string | null | undefined): Promise<string | null> {
  if (role === "admin") return "/dashboard"

  const activeMemberRole = await apiClient<ActiveMemberRoleResponse | null>(
    "/organization/get-active-member-role",
  )
  if (activeMemberRole && ["owner", "admin", "coach"].includes(activeMemberRole.role)) {
    return "/club/dashboard"
  }
  return null
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set once sign-in succeeds but the account still needs to change its temp password.
  const [pendingPasswordChange, setPendingPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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

      const signedInUser = result.data.user as typeof result.data.user & {
        mustChangePassword?: boolean
        role?: string | null
      }

      if (signedInUser.mustChangePassword) {
        setPendingPasswordChange(true)
        setIsLoading(false)
        return
      }

      const destination = await resolveDestination(signedInUser.role)
      if (!destination) {
        setError("Ce compte n'a accès à aucun dashboard d'administration.")
        setIsLoading(false)
        return
      }
      router.push(destination)
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.")
      return
    }

    setIsLoading(true)
    try {
      const result = await authClient.changePassword({
        currentPassword: password,
        newPassword,
      })

      if (result.error) {
        setError(result.error.message || "Impossible de changer le mot de passe")
        setIsLoading(false)
        return
      }

      await apiClient("/user/clear-must-change-password", { method: "POST" })

      const session = await authClient.getSession()
      const sessionUser = session.data?.user as { role?: string | null } | undefined
      const destination = await resolveDestination(sessionUser?.role)
      if (!destination) {
        setError("Ce compte n'a accès à aucun dashboard d'administration.")
        setIsLoading(false)
        return
      }
      router.push(destination)
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setIsLoading(false)
    }
  }

  if (pendingPasswordChange) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl uppercase tracking-tight">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription>
              Première connexion — choisis un mot de passe personnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmer</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : null}
                  Valider
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl uppercase tracking-tight">Administration</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aceclub.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
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
    </div>
  )
}
