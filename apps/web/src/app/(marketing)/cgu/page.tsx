import { redirect } from "next/navigation";

// CGU now lives at /terms — redirect old links here.
export default function CGUPage() {
  redirect("/terms");
}
