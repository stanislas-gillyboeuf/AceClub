import { View, Text, StyleSheet, Alert, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Camera, X } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii } from "@/constants/theme";
import { useDeleteMatchPhoto } from "@/hooks/use-match";
import { useTakeMatchPhoto } from "@/features/matches/hooks/use-take-match-photo";
import type { MatchDetail } from "@/types/match";

interface PhotoCardProps {
  matchDetail: MatchDetail;
  currentUserId: string;
  isParticipant: boolean;
}

export function PhotoCard({ matchDetail, currentUserId, isParticipant }: PhotoCardProps) {
  const scheme = useColorScheme();
  const { takePhoto, isPending } = useTakeMatchPhoto(matchDetail.match.id);
  const deletePhoto = useDeleteMatchPhoto();

  const photos = matchDetail.photos ?? [];
  const hasUserPhoto = photos.some((p) => p.userId === currentUserId);
  const canTakePhoto = isParticipant && !hasUserPhoto && photos.length < 2;

  const handleDeletePhoto = () => {
    Alert.alert("Supprimer la photo", "Es-tu sûr de vouloir supprimer ta photo ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deletePhoto.mutate(matchDetail.match.id),
      },
    ]);
  };

  if (photos.length === 0 && !canTakePhoto) return null;

  return (
    <Card>
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        Photos
      </Text>

      <View style={styles.photosRow}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.photoContainer}>
            <Image
              source={{ uri: photo.imageUrl }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
            {photo.userId === currentUserId && (
              <Pressable
                style={styles.deleteButton}
                onPress={handleDeletePhoto}
                hitSlop={8}
              >
                <X size={14} color={colors.white} strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        ))}

        {canTakePhoto && (
          <Pressable
            style={[
              styles.addPhotoButton,
              { borderColor: semanticColors.borderColor[scheme] },
            ]}
            onPress={takePhoto}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={colors.accentGreen} />
            ) : (
              <>
                <Camera size={24} color={colors.accentGreen} strokeWidth={1.5} />
                <Text style={[styles.addPhotoText, { color: semanticColors.labelSecondary[scheme] }]}>
                  Prendre une photo
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: "row",
    gap: 8,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoButton: {
    flex: 1,
    aspectRatio: 4 / 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addPhotoText: {
    fontSize: 12,
  },
});
