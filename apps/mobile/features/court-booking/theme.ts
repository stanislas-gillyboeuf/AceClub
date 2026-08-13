import { Platform } from "react-native";

export const courtColors = {
  ink900: "#081814",
  ink800: "#0c221c",
  ink700: "#123027",
  ink650: "#173a2f",
  line: "#274f42",
  lineQuiet: "#1a3329",
  chalk: "#f3f1e6",
  chalkDim: "#b9c4bc",
  chalkFaint: "#5d6b64",
  chartreuse: "#d7ff3f",
  chartreuseDim: "#8fae2a",
  rust: "#e0673a",
  rustDim: "#7a4231",
  amber: "#e3b23c",
  amberDim: "#8a6a26",
} as const;

/** No custom family — the system font stack (San Francisco on iOS) matches the reference design. */
export const courtFontMono = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });
