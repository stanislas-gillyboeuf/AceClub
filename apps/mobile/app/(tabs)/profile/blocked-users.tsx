import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useBlockedUsers, useUnblockUser } from "@/hooks/use-block";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors } from "@/constants/theme";
import { Avatar } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { BlockedUser } from "@/types/user";

export default function BlockedUsersScreen() {
  const scheme = useColorScheme();
  const { data, isLoading } = useBlockedUsers();
  const unblockUser = useUnblockUser();

  const users = data?.users ?? [];

  return (
    <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
      <Stack.Screen options={{ title: "Utilisateurs bloqués" }} />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentGreen} />
        </View>
      ) : users.length === 0 ? (
        <EmptyState
          icon="ShieldOff"
          title="Aucun utilisateur bloqué"
          description="Les joueurs que vous bloquez apparaîtront ici."
          containerStyle={styles.centered}
        />
      ) : (
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }: { item: BlockedUser }) => (
            <View style={styles.row}>
              <Avatar imageUrl={item.image} name={item.name} size={44} />
              <Text style={[styles.name, { color: semanticColors.labelPrimary[scheme] }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Button
                label="Débloquer"
                variant="secondary"
                loading={unblockUser.isPending}
                onPress={() => unblockUser.mutate(item.id)}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flex: 1, fontSize: 16, fontWeight: "500" },
  separator: { height: 12 },
});
