# AceClub Component Pattern

Use this skill when creating or modifying a UI component in the AceClub Expo app.

## Trigger

When creating or modifying a file under `apps/mobile/components/` or `apps/mobile/features/*/components/`.

## File Structure (mandatory order)

```tsx
// 1. Imports
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SomeIcon } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors, semanticColors, radii, spacing } from "@/constants/theme";

// 2. Props interface
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

// 3. Export function
export function MyComponent({ title, onPress }: MyComponentProps) {
  const scheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: semanticColors.cardBackground[scheme] },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[styles.title, { color: semanticColors.labelPrimary[scheme] }]}>
        {title}
      </Text>
    </Pressable>
  );
}

// 4. StyleSheet at bottom
const styles = StyleSheet.create({
  container: {
    padding: spacing.card,
    borderRadius: radii.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
});
```

## Mandatory Rules

### 1. Theme — ALWAYS semantic colors
```tsx
const scheme = useColorScheme();

// GOOD
{ color: semanticColors.labelPrimary[scheme] }
{ backgroundColor: semanticColors.cardBackground[scheme] }
{ borderColor: semanticColors.borderColor[scheme] }

// BAD — NEVER hardcode hex
{ color: "#000000" }
{ backgroundColor: "#1C1C1E" }
{ backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F2F2F7" }
```

Available semantic tokens:
- `cardBackground` — card/surface backgrounds
- `primaryBackground` — screen backgrounds
- `borderColor` — borders and separators
- `labelPrimary` — main text
- `labelSecondary` — secondary/subtitle text
- `labelTertiary` — muted text
- `skeleton` — skeleton/placeholder backgrounds
- `divider` — thin dividers
- `systemGray5` — control backgrounds (segmented controls, input fields)
- `systemGray6` — secondary surfaces (pills, score boxes, stepper backgrounds)
- `incomingBubble` — chat incoming bubble
- `chatBackground` — chat screen background

Brand colors from `colors.*`:
- `colors.accentGreen` — primary accent
- `colors.accentOrange` — secondary accent
- `colors.systemGray` — system gray icon color
- `colors.red500` — destructive actions

### 2. Naming
- `components/ui/` — kebab-case: `glass-view.tsx`, `search-list.tsx`
- `features/*/components/` — PascalCase: `ChatBottomBar.tsx`, `MessageBubble.tsx`

### 3. StyleSheet.create() at bottom, always
Never inline complex styles. Extract to `StyleSheet.create()`.

### 4. Pressable with scale feedback
```tsx
<Pressable
  onPress={onPress}
  style={({ pressed }) => [
    styles.base,
    pressed && { transform: [{ scale: 0.98 }] },
  ]}
>
```

### 5. GlassView rules
```tsx
import { GlassView } from "@/components/ui/glass-view";

// GOOD
<GlassView style={styles.card} tintColor={colors.accentGreen}>
  {children}
</GlassView>

// BAD — NEVER set opacity < 1 on GlassView or its parents
<GlassView style={{ opacity: 0.8 }} /> // breaks glass rendering

// BAD — remove these styles when using GlassView
<GlassView style={{ backgroundColor: "white", borderWidth: 1, shadowColor: "#000" }} />
```
Use `tintColor` to color the glass. Use `transform: [{ scale: 0.98 }]` for pressed state (not opacity).

### 6. Icons
- Feature icons: `lucide-react-native` — `import { Heart } from "lucide-react-native"`
- System iOS icons: `IconSymbol` — `import { IconSymbol } from "@/components/ui/icon-symbol"`

### 7. Animations (Reanimated 4)
```tsx
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

<Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
  {children}
</Animated.View>
```
Always respect `useReducedMotion()` when using custom animations.

### 8. Reusable UI components
Always use existing UI components when available:
- `<Button>` for all buttons (`components/ui/button.tsx`)
- `<BadgePill>` for all badges/pills (`components/ui/badge-pill.tsx`)
- `<Card>` for all cards (`components/ui/card.tsx`)
- `<Avatar>` for all user avatars (`components/ui/avatar.tsx`)
- `<EmptyState>` for all empty states (`components/ui/empty-state.tsx`)
- `<SearchList>` for all searchable lists (`components/ui/search-list.tsx`)
- `<SegmentedControl>` for all segmented controls
- `<ProgressBar>` for all progress bars
- `<SettingsRow>` for all settings rows
- `<FormField>` for all form inputs

## Reference Files
- `apps/mobile/components/ui/glass-view.tsx` — cross-platform GlassView wrapper
- `apps/mobile/components/ui/card.tsx` — AnimatedPressable card
- `apps/mobile/components/ui/button.tsx` — variant + glass button
- `apps/mobile/components/ui/search-list.tsx` — generic TypeScript searchable list
