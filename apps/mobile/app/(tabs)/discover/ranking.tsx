import { View, Text, Platform, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Ranking() {
  const router = useRouter();

  const goBack = () => router.back();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <Pressable onPress={goBack}>
                    <MaterialIcons name="close" size={24} color="green" />
                  </Pressable>
                )
              : undefined,
        }}
      />

      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="xmark" onPress={goBack} tintColor="green" />
        </Stack.Toolbar>
      )}

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Ranking</Text>
      </View>
    </>
  );
}
