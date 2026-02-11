import { View, Text, Pressable } from "@/tw";
import { Calendar, Clock, Crown } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import type { MatchListItem, MatchParticipant } from "@/types/match";
import {
  getHomeParticipant,
  getAwayParticipant,
  formatMatchScore,
  getMatchDuration,
  didUserWin,
} from "@/lib/match-utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface FeedMatchRowProps {
  match: MatchListItem;
  currentUserId: string;
  onPress?: () => void;
}

export function FeedMatchRow({
  match,
  currentUserId,
  onPress,
}: FeedMatchRowProps) {
  const home = getHomeParticipant(match.participants);
  const away = getAwayParticipant(match.participants);
  const score = formatMatchScore(match.sets, match.participants);
  const duration = getMatchDuration(match);
  const userWon = didUserWin(match, currentUserId);

  const dateStr = match.finishedAt ?? match.startedAt ?? match.createdAt;
  const formattedDate = (() => {
    try {
      const date = parseISO(dateStr);
      return format(date, "EEE. d MMM", { locale: fr });
    } catch {
      return "";
    }
  })();

  const previewComments = match.comments
    ?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View className="p-card bg-bg-card dark:bg-bg-card-dark rounded-md border-[0.5px] border-border dark:border-border-dark">
        {/* Date + result badge */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={14} color="#34C759" />
            <Text className="text-sm font-sans text-label-secondary">
              {formattedDate}
            </Text>
          </View>

          <View
            className={`px-3 py-1.5 rounded-full ${userWon ? "bg-primary dark:bg-primary-dark" : "bg-destructive dark:bg-destructive-dark"}`}
          >
            <Text className="text-[11px] font-sans-semibold text-white">
              {userWon ? "Victoire" : "Défaite"}
            </Text>
          </View>
        </View>

        {/* Players + score */}
        <View className="flex-row items-center mt-3 gap-3">
          <ParticipantView
            participant={home}
            isWinner={home?.isWinner ?? false}
          />

          <Text className="text-sm font-sans text-label-secondary">vs</Text>

          <ParticipantView
            participant={away}
            isWinner={away?.isWinner ?? false}
          />

          <View className="flex-1" />

          <View className="items-end gap-1">
            <Text className="text-lg font-sans-bold text-label-primary dark:text-label-primary-dark font-mono">
              {score}
            </Text>
            {duration && (
              <View className="flex-row items-center gap-1">
                <Clock size={10} color="#8E8E93" />
                <Text className="text-xs font-sans text-label-secondary">
                  {duration}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Comments preview */}
        {previewComments && previewComments.length > 0 && (
          <View className="mt-3 pt-3 border-t border-border dark:border-border-dark gap-2">
            {previewComments.map((comment) => (
              <View key={comment.id} className="flex-row items-center gap-2">
                <Avatar
                  imageUrl={comment.user?.image}
                  name={comment.user?.name ?? "?"}
                  size={24}
                />
                <Text
                  className="text-xs font-sans text-label-primary dark:text-label-primary-dark flex-1"
                  numberOfLines={2}
                >
                  <Text className="font-sans-semibold">
                    {comment.user?.name}{" "}
                  </Text>
                  {comment.content}
                </Text>
              </View>
            ))}

            {match.comments.length > 2 && (
              <Text className="text-xs font-sans text-label-secondary">
                Voir les {match.comments.length} commentaires
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

function ParticipantView({
  participant,
  isWinner,
}: {
  participant?: MatchParticipant;
  isWinner: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Avatar
        imageUrl={participant?.user?.image}
        name={participant?.user?.name ?? "N/A"}
        size={40}
      />
      <View className="gap-0.5">
        <View className="flex-row items-center gap-1">
          <Text
            className={`text-sm ${isWinner ? "font-sans-bold" : "font-sans"} text-label-primary dark:text-label-primary-dark`}
            numberOfLines={1}
          >
            {participant?.user?.name ?? "N/A"}
          </Text>
          {isWinner && <Crown size={10} color="#FFD700" fill="#FFD700" />}
        </View>
      </View>
    </View>
  );
}
