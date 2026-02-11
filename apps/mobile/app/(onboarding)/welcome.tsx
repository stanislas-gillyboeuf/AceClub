import { View, Text, SafeAreaView } from "@/tw";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-primary dark:bg-bg-primary-dark">
      <View className="flex-1 justify-center items-center px-horizontal">
        <Text className="text-3xl font-sans-bold text-label-primary dark:text-label-primary-dark text-center">
          Bienvenue sur AceClub
        </Text>
        <Text className="text-base font-sans text-label-secondary mt-3 text-center">
          Configurons ton profil en quelques étapes
        </Text>
      </View>
      <View className="px-horizontal pb-8">
        <Button variant="primary" onPress={() => router.push("/(onboarding)/sport")}>
          Commencer
        </Button>
      </View>
    </SafeAreaView>
  );
}
