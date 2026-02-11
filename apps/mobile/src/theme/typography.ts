import { TextStyle } from "react-native";

export const typography = {
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 28,
    lineHeight: 34,
  },
  title2: {
    fontFamily: "Inter-Bold",
    fontSize: 22,
    lineHeight: 28,
  },
  title3: {
    fontFamily: "Inter-SemiBold",
    fontSize: 20,
    lineHeight: 25,
  },
  headline: {
    fontFamily: "Inter-SemiBold",
    fontSize: 17,
    lineHeight: 22,
  },
  body: {
    fontFamily: "Inter-Regular",
    fontSize: 17,
    lineHeight: 22,
  },
  callout: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    lineHeight: 21,
  },
  subheadline: {
    fontFamily: "Inter-Regular",
    fontSize: 15,
    lineHeight: 20,
  },
  footnote: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: "JetBrainsMono-Regular",
    fontSize: 14,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;
