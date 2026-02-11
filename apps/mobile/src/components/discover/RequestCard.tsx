import { View, Text, Pressable } from "@/tw";
import { ActivityIndicator } from "react-native";
import { Check, X, Clock, Swords, Dumbbell } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type { MatchRequestWithDetails } from "@/types/match-intent";

interface RequestCardProps {
  request: MatchRequestWithDetails;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export function RequestCard({
  request,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: RequestCardProps) {
  const intent = request.matchIntent;
  const requester = request.requester;
  const isPending = request.status === "pending";

  const formatDate = (date: string | null) => {
    if (!date) return "Flexible";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h${m}` : `${h}h`;
    }
    return `${minutes}min`;
  };

  return (
    <Card className="p-card">
      <View className="flex-row items-center gap-3">
        <Avatar
          imageUrl={null}
          name={requester?.name ?? "?"}
          size={44}
        />
        <View className="flex-1">
          <Text className="text-base font-sans-semibold text-label-primary dark:text-label-primary-dark">
            {requester?.name ?? "Joueur"}
          </Text>
          <Text className="text-xs font-sans text-label-secondary mt-0.5">
            {new Date(request.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Status badge */}
        {!isPending && (
          <View
            className={`px-2.5 py-1 rounded-full ${
              request.status === "accepted"
                ? "bg-primary/10 dark:bg-primary-dark/10"
                : "bg-destructive/10 dark:bg-destructive-dark/10"
            }`}
          >
            <Text
              className={`text-xs font-sans-medium ${
                request.status === "accepted"
                  ? "text-primary dark:text-primary-dark"
                  : "text-destructive dark:text-destructive-dark"
              }`}
            >
              {request.status === "accepted" ? "Acceptée" : "Refusée"}
            </Text>
          </View>
        )}
      </View>

      {/* Intent info */}
      {intent && (
        <View className="flex-row items-center gap-3 mt-3 ml-[56px]">
          {intent.type === "match" ? (
            <Swords size={14} color="#8E8E93" />
          ) : (
            <Dumbbell size={14} color="#8E8E93" />
          )}
          <Text className="text-sm font-sans text-label-secondary">
            {intent.type === "match" ? "Match" : "Entraînement"}
          </Text>
          <Text className="text-label-tertiary dark:text-label-tertiary-dark">
            ·
          </Text>
          <Clock size={14} color="#8E8E93" />
          <Text className="text-sm font-sans text-label-secondary">
            {formatDate(intent.date)} · {formatDuration(intent.duration)}
          </Text>
        </View>
      )}

      {/* Action buttons for pending requests */}
      {isPending && (
        <View className="flex-row gap-3 mt-4 ml-[56px]">
          <Pressable
            onPress={() => onReject(request.id)}
            disabled={isRejecting || isAccepting}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-md bg-bg-primary dark:bg-bg-primary-dark border-[0.5px] border-border dark:border-border-dark"
          >
            {isRejecting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <>
                <X size={16} color="#FF3B30" />
                <Text className="text-sm font-sans-medium text-destructive dark:text-destructive-dark">
                  Refuser
                </Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={() => onAccept(request.id)}
            disabled={isAccepting || isRejecting}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-md bg-primary dark:bg-primary-dark"
          >
            {isAccepting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Check size={16} color="#FFFFFF" />
                <Text className="text-sm font-sans-medium text-white">
                  Accepter
                </Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </Card>
  );
}
