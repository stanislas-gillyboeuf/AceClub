import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUploadMatchPhoto } from "@/hooks/use-match";

export function useTakeMatchPhoto(matchId: string) {
  const uploadPhoto = useUploadMatchPhoto();

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    uploadPhoto.mutate({
      matchId,
      uri: asset.uri,
      fileName: asset.fileName ?? `match-photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
    });
  };

  return { takePhoto, isPending: uploadPhoto.isPending };
}
