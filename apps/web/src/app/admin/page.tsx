import Link from "next/link";
import { Users, Building2, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de l&apos;administration AceClub.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/users"
          className="group flex items-center gap-4 rounded-lg border p-6 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Utilisateurs</h2>
            <p className="text-sm text-muted-foreground">
              Lister, rechercher et gerer les utilisateurs.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/admin/organizations"
          className="group flex items-center gap-4 rounded-lg border p-6 transition-colors hover:bg-muted/50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Organisations</h2>
            <p className="text-sm text-muted-foreground">
              Lister, rechercher et gerer les organisations.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
