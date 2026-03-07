# AceClub Screen Pattern

Use this skill when creating or modifying a mobile screen in the AceClub Expo app.

## Trigger

When creating or modifying a file under `apps/mobile/app/`.

## Screen Structure (mandatory order)

```tsx
<>
  <Stack.Screen options={{ title: "Screen Title", headerLargeTitle: true }} />
  {/* Platform toolbar (if actions needed) */}
  {Platform.OS === "ios" ? (
    <Stack.Toolbar>
      <ToolbarItem onPress={action}><Icon /></ToolbarItem>
    </Stack.Toolbar>
  ) : null}
  <FlatList
    style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
    data={items}
    renderItem={renderItem}
    keyExtractor={(item) => item.id}
    ListHeaderComponent={<HeaderContent />}
    ListEmptyComponent={isLoading ? <Skeleton /> : <EmptyState />}
    contentInsetAdjustmentBehavior="automatic"
    keyboardShouldPersistTaps="handled"
    refreshControl={
      <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
    }
    onEndReached={hasNextPage ? fetchNextPage : undefined}
    onEndReachedThreshold={0.3}
  />
</>
```

## Mandatory Rules

### 1. Stack.Screen always first
```tsx
<Stack.Screen options={{ title: "My Screen", headerLargeTitle: true }} />
```
For `formSheet` presentations:
```tsx
<Stack.Screen options={{ presentation: "formSheet", title: "Edit" }} />
```

### 2. State Machine: Loading → Error → Empty → Content
Every screen MUST handle all 4 states:
```tsx
const { data, isLoading, isError, refetch, isRefetching } = useMyQuery();

// Loading
if (isLoading) return <Skeleton />;
// or use ListEmptyComponent for inline loading

// Error
if (isError) return <EmptyState title="Erreur" subtitle="Réessayer" onRetry={refetch} />;

// Empty + Content handled by FlatList:
// ListEmptyComponent for empty, data for content
```

### 3. FlatList as root scroll (NEVER nest)
- **NEVER** wrap a `FlatList` in a `ScrollView` — causes "VirtualizedLists should never be nested" error
- **NEVER** use a plain `View` as root of a scrollable screen — content hides behind native header
- Use `ListHeaderComponent` for content above the list
- Use `SectionList` for grouped data (matches by date, etc.)

### 4. contentInsetAdjustmentBehavior="automatic"
Required on every `FlatList`, `SectionList`, or `ScrollView` to respect the native header inset on iOS.

### 5. RefreshControl with isRefetching
```tsx
refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
```

### 6. Background color
```tsx
style={{ flex: 1, backgroundColor: semanticColors.primaryBackground[scheme] }}
```

### 7. Infinite scroll with useInfiniteQuery
```tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(...);

const items = data?.pages.flatMap((page) => page.items) ?? [];

<FlatList
  data={items}
  onEndReached={hasNextPage ? fetchNextPage : undefined}
  onEndReachedThreshold={0.3}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

### 8. NEVER KeyboardAvoidingView in formSheet
iOS formSheet manages keyboard natively. `KeyboardAvoidingView` causes layout conflicts (0-height content).
```tsx
// BAD — invisible content in formSheet
<KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
  <FlatList ... />
</KeyboardAvoidingView>

// GOOD — formSheet handles keyboard natively
<FlatList style={{ flex: 1 }} ... />
```
`KeyboardAvoidingView` is valid ONLY for `fullScreenModal` or non-modal screens.

### 9. Platform toolbar
On iOS, use `Stack.Toolbar` for toolbar actions. On Android, use `headerRight` in `Stack.Screen options`.

## Reference Files
- `apps/mobile/app/(tabs)/feed/index.tsx` — FlatList + infinite scroll + RefreshControl
- `apps/mobile/app/(tabs)/matches/index.tsx` — SectionList + FAB
- `apps/mobile/app/(tabs)/chat/index.tsx` — FlatList + search header
