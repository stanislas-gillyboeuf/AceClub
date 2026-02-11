import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, Pressable } from "@/tw";
import { AlertTriangle } from "lucide-react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 bg-bg-primary dark:bg-bg-primary-dark items-center justify-center px-horizontal gap-4">
          <View className="w-16 h-16 rounded-full bg-destructive/10 dark:bg-destructive-dark/10 items-center justify-center">
            <AlertTriangle size={32} color="#FF3B30" />
          </View>
          <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark text-center">
            Quelque chose s'est mal passé
          </Text>
          <Text className="text-sm font-sans text-label-secondary text-center">
            Une erreur inattendue est survenue. Veuillez réessayer.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-primary dark:bg-primary-dark rounded-sm px-6 py-3 mt-2"
          >
            <Text className="text-white font-sans-semibold text-base">
              Réessayer
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
