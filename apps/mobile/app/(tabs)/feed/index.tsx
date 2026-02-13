import { Stack } from "expo-router";
import { Alert, View, Text, Platform, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Feed() {
  const onTrophy = () =>
    Alert.alert("Favoris", "Vous avez ajouté ce post à vos favoris !");

  return (
    <>
      <Stack.Screen
        options={{
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={onTrophy}>
                    <MaterialIcons name="emoji-events" size={24} />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="trophy" onPress={onTrophy} />
        </Stack.Toolbar>
      )}

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Feed</Text>
      </View>
    </>
  );
}
