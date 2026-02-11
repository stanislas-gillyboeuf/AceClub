import { View } from "@/tw";
import { type ViewProps, useColorScheme } from "react-native";
import { cn } from "@/lib/cn";

interface CardProps extends ViewProps {
  withBorder?: boolean;
  className?: string;
}

export function Card({
  children,
  withBorder = false,
  className,
  ...props
}: CardProps) {
  const colorScheme = useColorScheme();
  const showBorder = withBorder || colorScheme === "dark";

  return (
    <View
      className={cn(
        "bg-bg-card dark:bg-bg-card-dark rounded-md",
        showBorder && "border-[0.5px] border-border dark:border-border-dark",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
