import { ActionSheetIOS, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUploadMatchPhoto } from "@/hooks/use-match";

export function useTakeMatchPhoto(matchId: string) {
  const uploadPhoto = useUploadMatchPhoto();

  const uploadAsset = (asset: ImagePicker.ImagePickerAsset) => {
    uploadPhoto.mutate({
      matchId,
      uri: asset.uri,
      fileName: asset.fileName ?? `match-photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? "image/jpeg",
    });
  };

  const pickFromCamera = async () => {
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
    uploadAsset(result.assets[0]);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour choisir une photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    uploadAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Prendre une photo", "Choisir dans la galerie", "Annuler"],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) pickFromCamera();
          else if (index === 1) pickFromLibrary();
        },
      );
      return;
    }

    Alert.alert("Ajouter une photo", "Choisis une source", [
      { text: "Prendre une photo", onPress: pickFromCamera },
      { text: "Choisir dans la galerie", onPress: pickFromLibrary },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return { takePhoto, isPending: uploadPhoto.isPending };
}
