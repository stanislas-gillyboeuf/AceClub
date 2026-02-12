"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Camera } from "lucide-react";
import { useMe, usePreferences } from "@/hooks/use-user-queries";
import { useUpdateProfile, useUploadUserImage } from "@/hooks/use-user-mutations";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { TENNIS_LEVELS, PADEL_LEVELS, type Sport } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsForm() {
  const { data: me, isPending: mePending } = useMe();
  const { data: prefs } = usePreferences();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadUserImage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState<Sport | "">("");
  const [level, setLevel] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with user data once loaded
  if (me && prefs && !initialized) {
    setName(me.name ?? "");
    setPhone(me.phoneNumber ?? "");
    setSport(prefs.sport ?? "");
    setLevel(prefs.skillLevel ?? "");
    setInitialized(true);
  }

  if (mePending) {
    return <Skeleton className="h-96 w-full" />;
  }

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

  const handleSave = async () => {
    const data: Record<string, string> = {};
    if (name !== me?.name) data.name = name;
    if (phone !== me?.phoneNumber) data.phoneNumber = phone;
    if (sport && sport !== prefs?.sport) data.sport = sport;
    if (level && level !== prefs?.skillLevel) data.skillLevel = level;

    if (Object.keys(data).length > 0) {
      await updateProfile.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo de profil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <Avatar className="size-16">
              <AvatarImage src={preview ?? me?.image ?? undefined} />
              <AvatarFallback>
                <Camera className="size-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            {uploadImage.isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Changer la photo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Nom</Label>
            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={me?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-phone">Téléphone</Label>
            <Input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sport et niveau</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Sport</Label>
            <RadioGroup
              value={sport}
              onValueChange={(val) => {
                setSport(val as Sport);
                setLevel("");
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tennis" id="s-tennis" />
                <Label htmlFor="s-tennis">Tennis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="padel" id="s-padel" />
                <Label htmlFor="s-padel">Padel</Label>
              </div>
            </RadioGroup>
          </div>
          {sport && (
            <div className="space-y-2">
              <Label>Niveau</Label>
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
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateProfile.isPending} className="w-full">
        {updateProfile.isPending ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        Enregistrer les modifications
      </Button>

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zone de danger</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountDialog open={showDelete} onOpenChange={setShowDelete} />
    </div>
  );
}
