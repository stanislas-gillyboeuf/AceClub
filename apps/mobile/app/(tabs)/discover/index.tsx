import { Stack, useRouter } from "expo-router";
import { View, Text, Platform, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { green } from "react-native-reanimated/lib/typescript/Colors";

export default function Discover() {
  const router = useRouter();

  const goToRanking = () => router.push("/(tabs)/discover/ranking");

  return (
    <>
      <Stack.Screen
        options={{
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={goToRanking}>
                    <MaterialIcons name="emoji-events" size={24} color="green" />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="trophy" onPress={goToRanking} tintColor="green" />
        </Stack.Toolbar>
      )}

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Discover</Text>
      </View>
    </>
  );
}
