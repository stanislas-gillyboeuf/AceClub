import { TextInput } from "@/tw";
import type { TextInputProps } from "react-native";
import { cn } from "@/lib/cn";

interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        "bg-bg-input dark:bg-bg-input-dark",
        "text-label-primary dark:text-label-primary-dark",
        "font-sans text-base",
        "px-3.5 py-3.5",
        "rounded-[10px]",
        className
      )}
      placeholderTextColor="#8E8E93"
      {...props}
    />
  );
}
