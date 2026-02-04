import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface ContactFormData {
  clubName: string;
  email: string;
  phone?: string;
  memberCount?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json(
      { error: "Service de messagerie non configuré" },
      { status: 503 }
    );
  }

  try {
    const body: ContactFormData = await request.json();

    // Validation
    if (!body.clubName || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs obligatoires" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "AceClub <noreply@aceclub.app>",
      to: ["contact@aceclub.app"],
      replyTo: body.email,
      subject: `[Contact AceClub] ${body.clubName}`,
      html: `
        <h2>Nouvelle demande de contact</h2>

        <h3>Informations du club</h3>
        <p><strong>Nom du club :</strong> ${body.clubName}</p>
        <p><strong>Email :</strong> ${body.email}</p>
        <p><strong>Téléphone :</strong> ${body.phone || "Non renseigné"}</p>
        <p><strong>Nombre de membres :</strong> ${body.memberCount || "Non renseigné"}</p>

        <h3>Message</h3>
        <p>${body.message.replace(/\n/g, "<br>")}</p>

        <hr>
        <p style="color: #666; font-size: 12px;">
          Ce message a été envoyé via le formulaire de contact du site aceclub.app
        </p>
      `,
      text: `
Nouvelle demande de contact

Informations du club
--------------------
Nom du club : ${body.clubName}
Email : ${body.email}
Téléphone : ${body.phone || "Non renseigné"}
Nombre de membres : ${body.memberCount || "Non renseigné"}

Message
-------
${body.message}

---
Ce message a été envoyé via le formulaire de contact du site aceclub.app
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message. Veuillez réessayer." },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    await resend.emails.send({
      from: "AceClub <noreply@aceclub.app>",
      to: [body.email],
      subject: "Merci pour votre intérêt - AceClub",
      html: `
        <h2>Bonjour,</h2>

        <p>Merci d'avoir contacté AceClub pour votre club <strong>${body.clubName}</strong>.</p>

        <p>Nous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.</p>

        <p>En attendant, n'hésitez pas à visiter notre site <a href="https://aceclub.app">aceclub.app</a> pour en savoir plus sur nos fonctionnalités.</p>

        <p>À bientôt,<br>L'équipe AceClub</p>

        <hr>
        <p style="color: #666; font-size: 12px;">
          Ceci est un email automatique, merci de ne pas y répondre directement.
        </p>
      `,
      text: `
Bonjour,

Merci d'avoir contacté AceClub pour votre club ${body.clubName}.

Nous avons bien reçu votre demande et reviendrons vers vous dans les plus brefs délais.

En attendant, n'hésitez pas à visiter notre site aceclub.app pour en savoir plus sur nos fonctionnalités.

À bientôt,
L'équipe AceClub

---
Ceci est un email automatique, merci de ne pas y répondre directement.
      `,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
