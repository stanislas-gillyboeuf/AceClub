"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

// Type workaround for framer-motion with React 19
// These typed components allow className and other standard HTML attributes

export const MotionDiv = motion.div as React.FC<
  HTMLMotionProps<"div"> & { className?: string; children?: React.ReactNode }
>;

export const MotionH1 = motion.h1 as React.FC<
  HTMLMotionProps<"h1"> & { className?: string; children?: React.ReactNode }
>;

export const MotionH2 = motion.h2 as React.FC<
  HTMLMotionProps<"h2"> & { className?: string; children?: React.ReactNode }
>;

export const MotionH3 = motion.h3 as React.FC<
  HTMLMotionProps<"h3"> & { className?: string; children?: React.ReactNode }
>;

export const MotionP = motion.p as React.FC<
  HTMLMotionProps<"p"> & { className?: string; children?: React.ReactNode }
>;

export const MotionSpan = motion.span as React.FC<
  HTMLMotionProps<"span"> & { className?: string; children?: React.ReactNode }
>;

export const MotionHeader = motion.header as React.FC<
  HTMLMotionProps<"header"> & { className?: string; children?: React.ReactNode }
>;

export const MotionHr = motion.hr as React.FC<
  HTMLMotionProps<"hr"> & { className?: string }
>;

export const MotionNav = motion.nav as React.FC<
  HTMLMotionProps<"nav"> & { className?: string; children?: React.ReactNode }
>;

export const MotionA = motion.a as React.FC<
  HTMLMotionProps<"a"> & { className?: string; children?: React.ReactNode; href?: string }
>;

export const MotionImg = motion.img as React.ForwardRefExoticComponent<
  HTMLMotionProps<"img"> & { className?: string; src?: string; alt?: string } & React.RefAttributes<HTMLImageElement>
>;
