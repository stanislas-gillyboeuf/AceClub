"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config";
import { CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Vous souhaitez équiper votre club avec AceClub ? Remplissez le formulaire ci-dessous et
          nous vous recontacterons dans les plus brefs délais.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="order-2 md:order-1">
          <div className="bg-muted/50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6">Nos coordonnées</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <a
                    href={`mailto:${siteConfig.links.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {siteConfig.links.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Téléphone</h3>
                  <p className="text-muted-foreground">Sur demande</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Localisation</h3>
                  <p className="text-muted-foreground">Paris, France</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-medium mb-4">Pourquoi choisir AceClub ?</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Application gratuite pour vos membres</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Mise en place rapide et accompagnement dédié</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Support réactif et à l'écoute</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Évolutions régulières basées sur vos retours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {isSuccess ? (
            <div className="bg-primary/10 rounded-2xl p-8 text-center">
              <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Message envoyé !</h2>
              <p className="text-muted-foreground mb-6">
                Merci pour votre intérêt. Nous vous recontacterons dans les plus brefs délais.
              </p>
              <Button asChild>
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@votreclub.fr"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberCount">Nombre de membres (estimation)</Label>
                <Input
                  id="memberCount"
                  name="memberCount"
                  type="text"
                  placeholder="Ex: 150"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Parlez-nous de votre club et de vos besoins..."
                  rows={5}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full rounded-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le message"
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
          )}
        </div>
      </div>
    </div>
  );
}
