import { useMemo, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Platform, SectionList, RefreshControl, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, spacing } from "@/constants/theme";
import { useInfiniteMatches } from "@/hooks/use-match";
import { MatchRow } from "@/features/matches/components/match-row";
import { MatchDateHeader } from "@/features/matches/components/match-date-header";
import { buildSections, type MatchSection } from "@/features/matches/components/match-sections";
import { MatchListSkeleton } from "@/features/matches/components/MatchListSkeleton";
import { MatchFab } from "@/features/matches/components/MatchFab";
import { MatchEmptyDay } from "@/features/matches/components/MatchEmptyDay";
import { EmptyState } from "@/components/ui/empty-state";
import { MessagesHeaderButton } from "@/features/chat/components/MessagesHeaderButton";

function ItemSeparator() {
  return <View style={separatorStyle} />;
}
const separatorStyle = { height: 12 };

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

  const { sections, todaySectionIndex } = useMemo(() => {
    const built = buildSections(allMatches);
    return { sections: built, todaySectionIndex: built.findIndex((s) => s.isToday) };
  }, [allMatches]);

  const onCreateMatch = () => {
    router.push("/matches/create");
  };

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const scrollToToday = () => {
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
      } catch {}
    }, 350);
  };

  const toolbar = (
    <>
      <Stack.Screen
        options={{
          title: "Matchs",
          headerLeft: Platform.OS === "android" ? () => <MessagesHeaderButton /> : undefined,
        }}
      />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button icon="message" onPress={() => router.push("/chat")} tintColor={colors.accentGreen} />
        </Stack.Toolbar>
      )}
    </>
  );

  if (isLoading && allMatches.length === 0) {
    return (
      <View style={styles.container}>
        {toolbar}
        <MatchListSkeleton />
        <MatchFab onPress={onCreateMatch} />
      </View>
    );
  }

  if (!isLoading && allMatches.length === 0) {
    return (
      <View style={styles.container}>
        {toolbar}
        <View style={[styles.emptyContainer, { backgroundColor: semanticColors.primaryBackground[scheme] }]}>
          <EmptyState
            icon="Swords"
            title="Aucun match"
            description="Tes matchs apparaîtront ici une fois planifiés ou joués."
          />
        </View>
        <MatchFab onPress={onCreateMatch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            return <MatchEmptyDay />;
          }
          return (
            <View style={styles.sectionContent}>
              <MatchRow match={item} onPress={() => router.push(`/matches/${item.id}`)} />
            </View>
          );
        }}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onContentSizeChange={scrollToToday}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: semanticColors.primaryBackground[scheme] }}
      />
      <MatchFab onPress={onCreateMatch} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionContent: {
    paddingHorizontal: spacing.horizontal,
  },
});
