import { View, Text, SafeAreaView } from "@/tw";

export default function PhoneScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
      <View className="flex-1 px-horizontal pt-4">
        <Text className="text-2xl font-sans-bold text-label-primary dark:text-label-primary-dark">
          Ton numéro
        </Text>
      </View>
    </SafeAreaView>
  );
}
