import { type ReactNode } from "react";
import { SelectableTile } from "@/components/ui/selectable-tile";

interface ActivityTileProps {
  icon: ReactNode;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function ActivityTile({
  icon,
  label,
  isSelected,
  onPress,
}: ActivityTileProps) {
  return (
    <SelectableTile
      icon={icon}
      label={label}
      isSelected={isSelected}
      onPress={onPress}
    />
  );
}
