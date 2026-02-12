"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useUploadUserImage } from "@/hooks/use-user-mutations";

interface StepPhotoProps {
  onNext: (imageUrl?: string) => void;
  onBack: () => void;
}

export function StepPhoto({ onNext, onBack }: StepPhotoProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadUserImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      const result = await upload.mutateAsync(file);
      setImageUrl(result.imageUrl);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo de profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <Avatar className="size-24">
              <AvatarImage src={preview ?? undefined} />
              <AvatarFallback>
                <Camera className="size-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            {upload.isPending && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground">
            Appuyez pour ajouter une photo (optionnel)
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Retour
          </Button>
          <Button onClick={() => onNext(imageUrl)} disabled={upload.isPending} className="flex-1">
            {imageUrl ? "Suivant" : "Passer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
