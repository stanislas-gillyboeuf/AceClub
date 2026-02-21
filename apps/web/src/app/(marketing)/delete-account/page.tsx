"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export default function DeleteAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      clubName: formData.get("clubName") as string,
      reason: formData.get("reason") as string || undefined,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/account-deletion-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Une erreur est survenue");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Demande de suppression de compte</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vous souhaitez supprimer votre compte AceClub ? Remplissez le formulaire
          ci-dessous et notre équipe traitera votre demande.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-primary/10 rounded-2xl p-8 text-center">
          <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Demande envoyée</h2>
          <p className="text-muted-foreground mb-6">
            Votre demande de suppression de compte a bien été enregistrée.
            Notre équipe la traitera dans les plus brefs délais.
          </p>
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              La suppression de votre compte est irréversible. Toutes vos données
              personnelles, historique de matchs et messages seront définitivement
              supprimés.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Votre prénom"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Votre nom"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email du compte *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clubName">Nom du club *</Label>
              <Input
                id="clubName"
                name="clubName"
                placeholder="Ex: Tennis Club de Paris"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la suppression (optionnel)</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              variant="destructive"
              className="w-full rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande de suppression"
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              En soumettant ce formulaire, vous acceptez notre{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </form>
        </>
      )}
    </div>
  );
}
