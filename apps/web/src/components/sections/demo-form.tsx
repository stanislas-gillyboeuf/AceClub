"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export function DemoForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      clubName: formData.get("clubName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      memberCount: formData.get("memberCount") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-mkt-light-border bg-mkt-light-raised p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-mkt-accent/15">
          <CheckCircle className="h-7 w-7 text-mkt-accent" />
        </div>
        <h3 className="text-xl font-semibold">Demande envoyée</h3>
        <p className="mt-2 text-[15px] text-mkt-light-fg-dim">
          Merci pour votre intérêt. On revient vers vous rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="clubName">Nom du club *</Label>
        <Input id="clubName" name="clubName" placeholder="Ex: Tennis Club de Paris" required disabled={isLoading} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" placeholder="contact@votreclub.fr" required disabled={isLoading} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone (optionnel)</Label>
          <Input id="phone" name="phone" type="tel" placeholder="06 12 34 56 78" disabled={isLoading} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="memberCount">Nombre de membres (estimation)</Label>
        <Input id="memberCount" name="memberCount" type="text" placeholder="Ex: 150" disabled={isLoading} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Parlez-nous de votre club et de vos besoins..."
          rows={4}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <Button type="submit" size="lg" className="w-full rounded-full bg-mkt-accent text-mkt-accent-foreground hover:bg-mkt-accent/90" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Réserver une démo"
        )}
      </Button>
    </form>
  );
}
