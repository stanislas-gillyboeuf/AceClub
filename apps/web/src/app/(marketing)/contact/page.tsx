"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config";
import { easeInOutCubic } from "@/lib/animation";
import { MotionDiv } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";

const STEPS = [
  {
    id: "club",
    title: "Parlez-nous de votre club",
    subtitle: "On veut tout savoir",
    icon: Building2,
  },
  {
    id: "contact",
    title: "Comment vous joindre ?",
    subtitle: "Pour qu'on puisse se parler",
    icon: Mail,
  },
  {
    id: "message",
    title: "Un message pour nous ?",
    subtitle: "Dites-nous tout",
    icon: MessageSquare,
  },
] as const;

export default function ContactPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    clubName: "",
    memberCount: "",
    email: "",
    phone: "",
    message: "",
  });

  const updateField = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const canProceed = () => {
    if (step === 0) return formData.clubName.trim().length > 0;
    if (step === 1) return formData.email.trim().length > 0;
    if (step === 2) return formData.message.trim().length > 0;
    return false;
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canProceed()) {
      e.preventDefault();
      if (step < STEPS.length - 1) goNext();
      else handleSubmit();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px]" />
        </div>

        <MotionDiv
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
          className="text-center max-w-md relative z-10"
        >
          <MotionDiv
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeInOutCubic }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="h-10 w-10 text-primary" />
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-3">C'est envoyé !</h1>
            <p className="text-muted-foreground text-lg mb-8">
              On revient vers vous très vite pour discuter de{" "}
              <span className="text-foreground font-medium">{formData.clubName}</span>.
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </MotionDiv>
        </MotionDiv>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/3" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeInOutCubic }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Équipez votre club
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-3">
            Lancez-vous
          </h1>
          <p className="text-muted-foreground text-lg">
            3 petites questions et on s'occupe du reste.
          </p>
        </MotionDiv>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (i < step) {
                    setDirection(i < step ? -1 : 1);
                    setStep(i);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  i < step && "cursor-pointer",
                )}
                disabled={i > step}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500",
                    isActive && "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25",
                    isDone && "bg-primary/15 text-primary",
                    !isActive && !isDone && "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 rounded-full transition-all duration-500",
                      isDone ? "bg-primary/40" : "bg-muted",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div onKeyDown={handleKeyDown}>
          <AnimatePresence mode="wait" custom={direction}>
            <MotionDiv
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: easeInOutCubic }}
            >
              {/* Step title */}
              <div className="mb-8 text-center">
                <p className="text-sm font-medium text-primary mb-1">{STEPS[step].subtitle}</p>
                <h2 className="text-2xl font-bold tracking-tight">{STEPS[step].title}</h2>
              </div>

              {/* Step 1 - Club */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="clubName"
                      className="text-sm font-medium text-muted-foreground mb-2 block"
                    >
                      Nom du club <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="clubName"
                        value={formData.clubName}
                        onChange={(e) => updateField("clubName", e.target.value)}
                        placeholder="Tennis Club de Paris"
                        className="pl-10 h-12 rounded-xl bg-background"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="memberCount"
                      className="text-sm font-medium text-muted-foreground mb-2 block"
                    >
                      Nombre de membres (estimation)
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="memberCount"
                        value={formData.memberCount}
                        onChange={(e) => updateField("memberCount", e.target.value)}
                        placeholder="150"
                        className="pl-10 h-12 rounded-xl bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 - Contact */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-muted-foreground mb-2 block"
                    >
                      Email <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="contact@votreclub.fr"
                        className="pl-10 h-12 rounded-xl bg-background"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-muted-foreground mb-2 block"
                    >
                      Téléphone (optionnel)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="pl-10 h-12 rounded-xl bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Message */}
              {step === 2 && (
                <div>
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-muted-foreground mb-2 block"
                  >
                    Votre message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Parlez-nous de votre club, vos besoins, vos envies..."
                    rows={5}
                    className="rounded-xl bg-background resize-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 bg-destructive/10 text-destructive p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    className="rounded-full gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </Button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="rounded-full gap-2 px-6"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                    className="rounded-full gap-2 px-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        Envoyer
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </MotionDiv>
          </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Ou écrivez-nous directement à{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="text-primary hover:underline font-medium"
            >
              {siteConfig.links.email}
            </a>
          </p>
          <p className="text-xs text-muted-foreground/60">
            En soumettant ce formulaire, vous acceptez notre{" "}
            <Link href="/privacy" className="hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}
