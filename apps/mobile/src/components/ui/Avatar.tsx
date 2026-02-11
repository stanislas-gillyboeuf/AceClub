import { View, Text } from "@/tw";
import { Image } from "@/tw/image";
import { cn } from "@/lib/cn";
import { getUserInitials } from "@/types/user";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ imageUrl, name, size = 40, className }: AvatarProps) {
  const initials = getUserInitials(name);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={cn("bg-bg-secondary dark:bg-bg-secondary-dark", className)}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        "bg-primary/20 dark:bg-primary-dark/20 items-center justify-center",
        className
      )}
    >
      <Text
        style={{ fontSize: size * 0.36 }}
        className="font-sans-semibold text-primary dark:text-primary-dark"
      >
        {initials}
      </Text>
    </View>
  );
}
