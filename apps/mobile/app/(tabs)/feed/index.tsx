import { Stack } from "expo-router";
import { useState } from "react";
import { Alert, View, Text } from "react-native";

export default function Feed() {

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={"trophy"}
          onPress={() => Alert.alert("Favoris", "Vous avez ajouté ce post à vos favoris !")}
        />
      </Stack.Toolbar>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Feed</Text>
      </View>
    </>
  );
}
