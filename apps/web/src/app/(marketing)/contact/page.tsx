import { redirect } from "next/navigation";

// The demo booking page now lives on /demo — redirect old links here.
export default function ContactPage() {
  redirect("/demo");
}
