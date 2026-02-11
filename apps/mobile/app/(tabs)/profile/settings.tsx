import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "@/tw";
import {
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  LogOut,
  User,
  Phone,
  ChevronRight,
  Dumbbell,
  BarChart3,
  Bell,
  FileText,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { useUpdateProfile, usePreferences } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SPORTS = [
  { value: "tennis", label: "Tennis" },
  { value: "padel", label: "Padel" },
] as const;

const SKILL_LEVELS_TENNIS = ["Débutant", "Intermédiaire", "Avancé", "Compétition"];
const SKILL_LEVELS_PADEL = ["Débutant", "Intermédiaire", "Avancé", "Compétition"];

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useUpdateProfile();
  const preferences = usePreferences();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState((user as any)?.phoneNumber ?? "");

  const handleSaveName = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
    updateProfile.mutate(
      { name: trimmed },
      {
        onSuccess: () => setEditingName(false),
      }
    );
  }, [name, user?.name, updateProfile]);

  const handleSavePhone = useCallback(() => {
    const trimmed = phone.trim();
    if (trimmed === ((user as any)?.phoneNumber ?? "")) {
      setEditingPhone(false);
      return;
    }
    updateProfile.mutate(
      { phoneNumber: trimmed || undefined },
      {
        onSuccess: () => setEditingPhone(false),
      }
    );
  }, [phone, user, updateProfile]);

  const handleChangeSport = useCallback(() => {
    const currentSport = preferences.data?.sport;
    const options = SPORTS.map((s) => ({
      text: s.label,
      onPress: () => {
        if (s.value !== currentSport) {
          updateProfile.mutate({ sport: s.value });
        }
      },
    }));
    Alert.alert("Sport", "Choisissez votre sport", [
      ...options,
      { text: "Annuler", style: "cancel" },
    ]);
  }, [preferences.data?.sport, updateProfile]);

  const handleChangeLevel = useCallback(() => {
    const sport = preferences.data?.sport ?? "tennis";
    const levels =
      sport === "padel" ? SKILL_LEVELS_PADEL : SKILL_LEVELS_TENNIS;
    const options = levels.map((level) => ({
      text: level,
      onPress: () => {
        if (level !== preferences.data?.skillLevel) {
          updateProfile.mutate({ skillLevel: level });
        }
      },
    }));
    Alert.alert("Niveau", "Choisissez votre niveau", [
      ...options,
      { text: "Annuler", style: "cancel" },
    ]);
  }, [preferences.data, updateProfile]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }, [logout]);

  return (
    <SafeAreaView
      className="flex-1 bg-bg-primary dark:bg-bg-primary-dark"
      edges={["top"]}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-horizontal py-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={24} color="#34C759" />
          <Text className="text-primary dark:text-primary-dark font-sans-medium">
            Retour
          </Text>
        </Pressable>
        <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark">
          Paramètres
        </Text>
        <View className="w-16" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile section */}
        <View className="px-horizontal mt-4">
          <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wider mb-2">
            Profil
          </Text>
          <Card>
            {/* Avatar */}
            <View className="flex-row items-center gap-3 p-card border-b-[0.5px] border-border/50 dark:border-border-dark/50">
              <Avatar
                imageUrl={user?.image}
                name={user?.name ?? "?"}
                size={48}
              />
              <View className="flex-1">
                <Text className="text-base font-sans-medium text-label-primary dark:text-label-primary-dark">
                  {user?.name}
                </Text>
                <Text className="text-sm font-sans text-label-secondary">
                  {user?.email}
                </Text>
              </View>
            </View>

            {/* Name edit */}
            <Pressable
              onPress={() => setEditingName(true)}
              className="flex-row items-center gap-3 p-card border-b-[0.5px] border-border/50 dark:border-border-dark/50"
            >
              <User size={18} color="#8E8E93" />
              <View className="flex-1">
                <Text className="text-xs font-sans text-label-secondary">
                  Nom
                </Text>
                {editingName ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      autoFocus
                      className="flex-1 text-base font-sans text-label-primary dark:text-label-primary-dark py-1"
                      returnKeyType="done"
                      onSubmitEditing={handleSaveName}
                      onBlur={handleSaveName}
                    />
                    {updateProfile.isPending && (
                      <ActivityIndicator size="small" color="#34C759" />
                    )}
                  </View>
                ) : (
                  <Text className="text-base font-sans text-label-primary dark:text-label-primary-dark">
                    {user?.name}
                  </Text>
                )}
              </View>
              {!editingName && <ChevronRight size={16} color="#C7C7CC" />}
            </Pressable>

            {/* Phone */}
            <Pressable
              onPress={() => setEditingPhone(true)}
              className="flex-row items-center gap-3 p-card"
            >
              <Phone size={18} color="#8E8E93" />
              <View className="flex-1">
                <Text className="text-xs font-sans text-label-secondary">
                  Téléphone
                </Text>
                {editingPhone ? (
                  <View className="flex-row items-center gap-2">
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      autoFocus
                      className="flex-1 text-base font-sans text-label-primary dark:text-label-primary-dark py-1"
                      returnKeyType="done"
                      keyboardType="phone-pad"
                      onSubmitEditing={handleSavePhone}
                      onBlur={handleSavePhone}
                    />
                    {updateProfile.isPending && (
                      <ActivityIndicator size="small" color="#34C759" />
                    )}
                  </View>
                ) : (
                  <Text className="text-base font-sans text-label-primary dark:text-label-primary-dark">
                    {(user as any)?.phoneNumber || "Non renseigné"}
                  </Text>
                )}
              </View>
              {!editingPhone && <ChevronRight size={16} color="#C7C7CC" />}
            </Pressable>
          </Card>
        </View>

        {/* Preferences section */}
        <View className="px-horizontal mt-6">
          <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wider mb-2">
            Préférences
          </Text>
          <Card>
            {/* Sport */}
            <Pressable
              onPress={handleChangeSport}
              className="flex-row items-center gap-3 p-card border-b-[0.5px] border-border/50 dark:border-border-dark/50"
            >
              <Dumbbell size={18} color="#8E8E93" />
              <View className="flex-1">
                <Text className="text-xs font-sans text-label-secondary">
                  Sport
                </Text>
                <Text className="text-base font-sans text-label-primary dark:text-label-primary-dark">
                  {preferences.data?.sport === "tennis"
                    ? "Tennis"
                    : preferences.data?.sport === "padel"
                    ? "Padel"
                    : "Non défini"}
                </Text>
              </View>
              <ChevronRight size={16} color="#C7C7CC" />
            </Pressable>

            {/* Skill Level */}
            <Pressable
              onPress={handleChangeLevel}
              className="flex-row items-center gap-3 p-card"
            >
              <BarChart3 size={18} color="#8E8E93" />
              <View className="flex-1">
                <Text className="text-xs font-sans text-label-secondary">
                  Niveau
                </Text>
                <Text className="text-base font-sans text-label-primary dark:text-label-primary-dark">
                  {preferences.data?.skillLevel || "Non défini"}
                </Text>
              </View>
              <ChevronRight size={16} color="#C7C7CC" />
            </Pressable>
          </Card>
        </View>

        {/* Account section */}
        <View className="px-horizontal mt-6">
          <Text className="text-xs font-sans-semibold text-label-secondary uppercase tracking-wider mb-2">
            Compte
          </Text>
          <Card>
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center gap-3 p-card"
            >
              <LogOut size={18} color="#FF3B30" />
              <Text className="text-base font-sans-medium text-destructive dark:text-destructive-dark">
                Se déconnecter
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* App info */}
        <View className="px-horizontal mt-8 items-center">
          <Text className="text-xs font-sans text-label-tertiary dark:text-label-tertiary-dark">
            AceClub v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
