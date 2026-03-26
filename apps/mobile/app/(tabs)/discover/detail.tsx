import { useCallback } from "react";
import { Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { DiscoverDetailSheet } from "@/features/discover/components/discover-detail-sheet";
import { useDiscoverDetailStore } from "@/store/discover-detail";
import { colors } from "@/constants/theme";

export default function DiscoverDetailScreen() {
  const router = useRouter();
  const { selectedItem, setPendingAction } = useDiscoverDetailStore();

  const handleLike = useCallback(() => {
    setPendingAction("like");
    router.back();
  }, [setPendingAction, router]);

  const handlePass = useCallback(() => {
    setPendingAction("pass");
    router.back();
  }, [setPendingAction, router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (!selectedItem) return null;

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="xmark" onPress={handleClose} tintColor={colors.accentGreen} />
        </Stack.Toolbar>
      )}
      <DiscoverDetailSheet
        item={selectedItem}
        onLike={handleLike}
        onPass={handlePass}
        onClose={handleClose}
      />
    </>
  );
}
