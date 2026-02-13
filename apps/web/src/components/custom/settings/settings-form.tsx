"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Camera,
  User,
  Building2,
  Trophy,
  Bell,
  MapPin,
  FileText,
  Shield,
  AlertTriangle,
  ChevronRight,
  Search,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useMe, usePreferences } from "@/hooks/use-user-queries";
import { useUpdateProfile, useUploadUserImage } from "@/hooks/use-user-mutations";
import { useSearchOrganizations } from "@/hooks/use-org-queries";
import { useRequestClub } from "@/hooks/use-org-mutations";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { TENNIS_LEVELS, PADEL_LEVELS, type Sport } from "@/types/user";

// ---------- Section Header ----------
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

// ---------- Club Selection Dialog ----------
function ClubSelectionDialog({
  open,
  onOpenChange,
  currentOrgId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentOrgId: string | null;
  onSelect: (org: { id: string; name: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: orgs, isPending } = useSearchOrganizations(query || " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choisir un club</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un club..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-[200px]">
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Building2 className="size-10 opacity-40" />
              <p className="text-sm">Aucun club trouvé</p>
            </div>
          ) : (
            <div className="divide-y">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-1 py-3 text-left hover:bg-accent/50 rounded-md transition-colors"
                  onClick={() => {
                    onSelect({ id: org.id, name: org.name });
                    onOpenChange(false);
                  }}
                >
                  <span className="flex-1 text-sm">{org.name}</span>
                  {currentOrgId === org.id && <Check className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Settings Form ----------
export function SettingsForm() {
  const { data: me, isPending: mePending } = useMe();
  const { data: prefs } = usePreferences();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadUserImage();
  const requestClub = useRequestClub();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showClubDialog, setShowClubDialog] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState<Sport | "">("");
  const [level, setLevel] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Initialize form
  useEffect(() => {
    if (me && prefs && !initialized) {
      setName(me.name ?? "");
      setPhone(me.phoneNumber ?? "");
      setSport(prefs.sport ?? "");
      setLevel(prefs.skillLevel ?? "");
      if (prefs.organizationId && prefs.organizationName) {
        setSelectedOrg({ id: prefs.organizationId, name: prefs.organizationName });
      }
      setInitialized(true);
    }
  }, [me, prefs, initialized]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  // Check location permission
  useEffect(() => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationEnabled(result.state === "granted");
      });
    }
  }, []);

  if (mePending) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!me) return null;

  const levels = sport === "tennis" ? TENNIS_LEVELS : sport === "padel" ? PADEL_LEVELS : [];

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const result = await uploadImage.mutateAsync(file);
      await updateProfile.mutateAsync({ image: result.imageUrl });
    } catch {
      // handled
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleLocationToggle = (enabled: boolean) => {
    if (enabled && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationEnabled(true),
        () => setLocationEnabled(false),
      );
    } else {
      setLocationEnabled(false);
    }
  };

  const handleSave = async () => {
    const data: Record<string, string> = {};
    if (name !== me.name) data.name = name;
    if (phone !== (me.phoneNumber ?? "")) data.phoneNumber = phone;
    if (sport && sport !== prefs?.sport) data.sport = sport;
    if (level && level !== prefs?.skillLevel) data.skillLevel = level;
    if (selectedOrg && selectedOrg.id !== prefs?.organizationId) {
      data.organizationId = selectedOrg.id;
    }

    if (Object.keys(data).length > 0) {
      await updateProfile.mutateAsync(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const hasChanges =
    name !== (me.name ?? "") ||
    phone !== (me.phoneNumber ?? "") ||
    (sport && sport !== prefs?.sport) ||
    (level && level !== prefs?.skillLevel) ||
    (selectedOrg && selectedOrg.id !== prefs?.organizationId);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      {/* Profile Photo */}
      <div className="space-y-3">
        <SectionHeader icon={Camera} title="Photo de profil" />
        <Card className="p-5">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group"
            >
              <Avatar className="size-24 ring-2 ring-primary/20">
                <AvatarImage src={preview ?? me.image ?? undefined} />
                <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                  {me.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/30 transition-colors">
                <Camera className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {uploadImage.isPending && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Cliquez pour modifier</p>
          </div>
        </Card>
      </div>

      {/* Personal Info */}
      <div className="space-y-3">
        <SectionHeader icon={User} title="Informations personnelles" />
        <Card className="divide-y">
          <div className="p-4 space-y-1.5">
            <Label htmlFor="settings-name" className="text-xs text-muted-foreground">
              Nom complet
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
            />
          </div>
          <div className="p-4 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>
          <div className="p-4 space-y-1.5">
            <Label htmlFor="settings-phone" className="text-xs text-muted-foreground">
              Téléphone
            </Label>
            <Input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^+0-9 ()-]/g, "");
                setPhone(filtered);
              }}
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
            />
          </div>
        </Card>
      </div>

      {/* Club */}
      <div className="space-y-3">
        <SectionHeader icon={Building2} title="Club" />
        <Card
          className="p-4 cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => setShowClubDialog(true)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm ${selectedOrg ? "" : "text-muted-foreground"}`}>
              {selectedOrg?.name ?? "Sélectionner un club"}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Sport */}
      <div className="space-y-3">
        <SectionHeader icon={Trophy} title="Sport" />
        <Card className="divide-y">
          <button
            type="button"
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
            onClick={() => {
              setSport("tennis");
              setLevel("");
            }}
          >
            <span className="text-sm flex-1">Tennis</span>
            {sport === "tennis" && <Check className="size-4 text-primary" />}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
            onClick={() => {
              setSport("padel");
              setLevel("");
            }}
          >
            <span className="text-sm flex-1">Padel</span>
            {sport === "padel" && <Check className="size-4 text-primary" />}
          </button>
        </Card>
      </div>

      {/* Skill Level */}
      {sport && (
        <div className="space-y-3">
          <SectionHeader icon={Trophy} title="Niveau" />
          <Card className="p-4">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      )}

      {/* Notifications */}
      <div className="space-y-3">
        <SectionHeader icon={Bell} title="Notifications" />
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm">Notifications push</p>
              <p className="text-xs text-muted-foreground">
                Recevez des alertes pour les matchs et invitations
              </p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationToggle} />
          </div>
        </Card>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <SectionHeader icon={MapPin} title="Localisation" />
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm">Localisation</p>
              <p className="text-xs text-muted-foreground">
                Permet de trouver des joueurs proches de vous
              </p>
            </div>
            <Switch checked={locationEnabled} onCheckedChange={handleLocationToggle} />
          </div>
        </Card>
      </div>

      {/* Legal Links */}
      <div className="space-y-3">
        <SectionHeader icon={FileText} title="Informations légales" />
        <Card className="divide-y">
          <Link
            href="/cgu"
            target="_blank"
            className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
          >
            <FileText className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Conditions Générales d'Utilisation</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href="/privacy"
            target="_blank"
            className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
          >
            <Shield className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Politique de Confidentialité</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href="/contact"
            target="_blank"
            className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
          >
            <User className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Nous contacter</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </Card>
      </div>

      {/* Save button */}
      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-sm text-green-700 dark:text-green-300">
          <Check className="size-4" />
          Modifications enregistrées
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!hasChanges || updateProfile.isPending}
        className="w-full"
      >
        {updateProfile.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Enregistrer les modifications
      </Button>

      {/* Danger Zone */}
      <div className="space-y-3">
        <SectionHeader icon={AlertTriangle} title="Zone de danger" />
        <Card className="border-destructive/30 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 text-left"
            onClick={() => setShowDelete(true)}
          >
            <AlertTriangle className="size-4 text-destructive" />
            <div className="flex-1 space-y-0.5">
              <p className="text-sm text-destructive font-medium">Supprimer mon compte</p>
              <p className="text-xs text-muted-foreground">
                Cette action est définitive et irréversible
              </p>
            </div>
          </button>
        </Card>
      </div>

      <DeleteAccountDialog open={showDelete} onOpenChange={setShowDelete} />
      <ClubSelectionDialog
        open={showClubDialog}
        onOpenChange={setShowClubDialog}
        currentOrgId={selectedOrg?.id ?? null}
        onSelect={setSelectedOrg}
      />
    </div>
  );
}
