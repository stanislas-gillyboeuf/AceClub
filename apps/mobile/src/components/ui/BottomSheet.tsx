import { forwardRef, useCallback, useMemo } from "react";
import { View } from "@/tw";
import { useColorScheme } from "react-native";
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetProps as GorhomProps,
} from "@gorhom/bottom-sheet";

interface BottomSheetProps extends Partial<GorhomProps> {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  ({ children, snapPoints: customSnapPoints, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const snapPoints = useMemo(
      () => customSnapPoints ?? ["50%", "85%"],
      [customSnapPoints]
    );

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#48484A" : "#C7C7CC",
        }}
        backgroundStyle={{
          backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF",
        }}
        {...props}
      >
        <View className="flex-1 px-horizontal">{children}</View>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = "BottomSheet";
