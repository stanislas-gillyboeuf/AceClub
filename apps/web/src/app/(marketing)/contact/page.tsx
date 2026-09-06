import { redirect } from "next/navigation";

// The contact/demo request form now lives on /tarifs#demo — redirect old links here.
export default function ContactPage() {
  redirect("/tarifs#demo");
}
