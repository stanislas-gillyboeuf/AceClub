import { useMemo, useRef, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useRouter } from "expo-router";
import {
  View,
  Platform,
  Pressable,
  Alert,
  SectionList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { radii, semanticColors, spacing } from "@/constants/theme";
import { useInfiniteMatches } from "@/hooks/use-match";
import { MatchRow } from "@/features/matches/components/match-row";
import { MatchRowSkeleton } from "@/features/matches/components/match-row-skeleton";
import { MatchDateHeader } from "@/features/matches/components/match-date-header";
import { buildSections, type MatchSection } from "@/features/matches/components/match-sections";
import { EmptyState } from "@/components/ui/empty-state";

export default function Matches() {
  const router = useRouter();
  const scheme = useColorScheme();
  const sectionListRef = useRef<SectionList>(null);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteMatches({ limit: 20 });

  const allMatches = useMemo(
    () => data?.pages.flatMap((page) => page.matches) ?? [],
    [data]
  );

  const sections = useMemo(() => buildSections(allMatches), [allMatches]);

  const todaySectionIndex = useMemo(
    () => sections.findIndex((s) => s.isToday),
    [sections]
  );

  const onCreateMatch = () => {
    Alert.alert("Créer un match", "Bientôt disponible !");
  };

  const onOpenRequests = () => {
    router.push("/matches/requests");
  };

  const onEndReached =() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const scrollToToday =() => {
    if (hasScrolledToToday) return;
    if (todaySectionIndex < 0 || sections.length === 0) return;
    setHasScrolledToToday(true);
    setTimeout(() => {
      try {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: todaySectionIndex,
          itemIndex: 0,
          animated: true,
          viewOffset: 0,
        });
      } catch {
      }
    }, 350);
  };


  const toolbar = (
    <>
      <Stack.Screen
        options={{
          title: "Matchs",
          headerRight:
            Platform.OS === "android"
              ? () => (
                  <View style={styles.androidToolbar}>
                    <Pressable onPress={onOpenRequests}>
                      <MaterialIcons name="mail-outline" size={24} />
                    </Pressable>
                    <Pressable onPress={onCreateMatch}>
                      <MaterialIcons name="add" size={24} />
                    </Pressable>
                  </View>
                )
              : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="plus" onPress={onCreateMatch} />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button icon="envelope.badge" onPress={onOpenRequests} />
          </Stack.Toolbar>
        </>
      )}
    </>
  );


  if (isLoading && allMatches.length === 0) {
    return (
      <>
        {toolbar}
        <View style={[styles.container, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <View style={styles.skeletonList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <MatchRowSkeleton key={i} />
            ))}
          </View>
        </View>
      </>
    );
  }


  if (!isLoading && allMatches.length === 0) {
    return (
      <>
        {toolbar}
        <View style={[styles.emptyContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <EmptyState
            icon="Swords"
            title="Aucun match"
            description="Tes matchs apparaîtront ici une fois planifiés ou joués."
          />
        </View>
      </>
    );
  }

  return (
    <>
      {toolbar}
      <SectionList
        ref={sectionListRef}
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        keyExtractor={(item, index) =>
          typeof item === "string" ? `empty-${index}` : item.id
        }
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => {
          const s = section as MatchSection;
          return <MatchDateHeader date={s.date} isToday={s.isToday} />;
        }}
        renderItem={({ item }) => {
          if (typeof item === "string") {
            return (
              <View style={styles.sectionContent}>
                <EmptyState
                  icon="Swords"
                  title="Pas de match aujourd'hui"
                  description="Planifie un match et lance-toi !"
                  containerStyle={{ borderWidth: 1 , borderColor: semanticColors.borderColor[scheme], borderRadius: radii.md, backgroundColor: semanticColors.cardBackground[scheme] }}
                />
              </View>
            );
          }
          return (
            <View style={styles.sectionContent}>
              <MatchRow match={item} onPress={() => router.push(`/matches/${item.id}`)} />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onContentSizeChange={scrollToToday}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonList: {
    padding: spacing.horizontal,
    paddingTop: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionContent: {
    paddingHorizontal: spacing.horizontal,
  },
  androidToolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
