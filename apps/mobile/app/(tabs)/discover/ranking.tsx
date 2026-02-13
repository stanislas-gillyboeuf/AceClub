import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function Ranking() {
  const router = useRouter();

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="xmark" onPress={() => router.back()} />
      </Stack.Toolbar>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Ranking</Text>
      </View>
    </>
  );
}
