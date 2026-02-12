"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Calendar,
  PlayCircle,
  CheckCircle,
  Timer,
  Swords,
  Pencil,
  Check,
  MoreHorizontal,
  Trash2,
  MessageCircle,
  Send,
  ChevronRight,
  Plus,
  Minus,
  X,
  Loader2,
} from "lucide-react";
import { useMatch } from "@/hooks/use-match-queries";
import { useMe } from "@/hooks/use-user-queries";
import {
  useUpdateMatchStatus,
  useUpdateMatchScores,
  useDeleteMatch,
  useCreateComment,
} from "@/hooks/use-match-mutations";
import type { Match, MatchParticipant, MatchSet, MatchComment } from "@/types/match";

// --- Helpers ---

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMatchScore(sets: MatchSet[]): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const set of sets) {
    const hs = set.scores.find((s) => s.side === "home")?.games ?? 0;
    const as_ = set.scores.find((s) => s.side === "away")?.games ?? 0;
    if (hs > as_) home++;
    else if (as_ > hs) away++;
  }
  return { home, away };
}

function getDuration(startedAt: string | null, finishedAt: string | null): string | null {
  if (!startedAt || !finishedAt) return null;
  const diffMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (diffMs <= 0) return null;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getTypeLabel(type: string): string {
  return type === "training" ? "Entraînement" : "Match";
}

function calculateWinner(match: Match): string | null {
  if (match.sets.length === 0) return null;

  const setsWonByUser: Record<string, number> = {};

  for (const set of match.sets) {
    if (set.scores.length !== 2) continue;
    const sorted = [...set.scores].sort((a, b) => b.games - a.games);
    if (sorted[0].games > sorted[1].games) {
      setsWonByUser[sorted[0].userId] = (setsWonByUser[sorted[0].userId] ?? 0) + 1;
    }
  }

  let winnerId: string | null = null;
  let maxSets = 0;
  for (const [userId, count] of Object.entries(setsWonByUser)) {
    if (count > maxSets) {
      maxSets = count;
      winnerId = userId;
    }
  }

  return winnerId;
}

// --- Page ---

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: match, isPending } = useMatch(id);
  const { data: me } = useMe();
  const updateMatch = useUpdateMatchStatus(id);
  const deleteMatch = useDeleteMatch();

  const [showScoreEditor, setShowScoreEditor] = useState(false);

  const currentUserId = me?.id ?? "";

  if (isPending) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-sm font-medium">Match introuvable</p>
        <p className="text-xs text-muted-foreground">Ce match n&apos;existe pas ou a été supprimé.</p>
      </div>
    );
  }

  const home = match.participants.find((p) => p.side === "home");
  const away = match.participants.find((p) => p.side === "away");
  const isParticipant = match.participants.some((p) => p.userId === currentUserId);
  const isScheduled = match.status === "scheduled";
  const isOngoing = match.status === "ongoing";
  const isFinished = match.status === "finished";

  async function handleStart() {
    await updateMatch.mutateAsync({ status: "ongoing", startedAt: new Date().toISOString() });
  }

  async function handleFinish() {
    const winnerId = calculateWinner(match!);
    await updateMatch.mutateAsync({
      status: "finished",
      finishedAt: new Date().toISOString(),
      winnerId,
    });
    // Open score editor after finishing (like iOS)
    setShowScoreEditor(true);
  }

  async function handleDelete() {
    await deleteMatch.mutateAsync(id);
    router.push("/app/matches");
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <button type="button" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold">Détails du match</h1>
        <div className="size-5" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 px-5 pt-4 pb-28">
        {/* Hero Score Card */}
        <HeroScoreCard match={match} home={home} away={away} />

        {/* Live Timer (ongoing) */}
        {isOngoing && match.startedAt && <LiveTimerCard startedAt={match.startedAt} />}

        {/* Sets Card */}
        {match.sets.length > 0 && <SetsCard sets={match.sets} home={home} away={away} />}

        {/* Info Card */}
        <InfoCard match={match} />

        {/* Comments Card (finished) */}
        {isFinished && <CommentsCard matchId={match.id} comments={match.comments} currentUserId={currentUserId} isParticipant={isParticipant} />}
      </div>

      {/* Floating action bar */}
      {isParticipant && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 px-5 py-3 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
            {isScheduled && (
              <Button size="sm" variant="outline" onClick={handleStart} disabled={updateMatch.isPending} className="gap-1.5">
                {updateMatch.isPending ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4 text-primary" />}
                Démarrer
              </Button>
            )}

            {isOngoing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setShowScoreEditor(true)} className="gap-1.5">
                  <Pencil className="size-4 text-primary" />
                  Scores
                </Button>
                <Button size="sm" variant="outline" onClick={handleFinish} disabled={updateMatch.isPending} className="gap-1.5">
                  {updateMatch.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4 text-orange-500" />}
                  Terminer
                </Button>
              </>
            )}

            {isFinished && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Pencil className="size-4 text-orange-500" />
                    Modifier
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowScoreEditor(true)}>
                    <Swords className="mr-2 size-4" /> Scores
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="size-9">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 size-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Score editor dialog */}
      {match && home && away && (
        <ScoreEditorDialog
          open={showScoreEditor}
          onOpenChange={setShowScoreEditor}
          matchId={match.id}
          sets={match.sets}
          home={home}
          away={away}
        />
      )}
    </div>
  );
}

// --- Hero Score Card ---

function HeroScoreCard({ match, home, away }: { match: Match; home?: MatchParticipant; away?: MatchParticipant }) {
  const score = getMatchScore(match.sets);
  const hasScore = match.sets.length > 0;
  const isFinished = match.status === "finished";
  const hasWinner = match.participants.some((p) => p.isWinner);
  const duration = getDuration(match.startedAt, match.finishedAt);

  const statusConfig: Record<string, { label: string; color: string; bg: string; dot?: boolean }> = {
    scheduled: { label: "PLANIFIÉ", color: "text-blue-600", bg: "bg-blue-500/10" },
    ongoing: { label: "EN COURS", color: "text-red-600", bg: "bg-red-500/10", dot: true },
    finished: { label: "TERMINÉ", color: "text-green-600", bg: "bg-green-500/10" },
  };
  const status = statusConfig[match.status] ?? statusConfig.scheduled;

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-5">
      {/* Status pill */}
      <div className="flex justify-center">
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest ${status.color} ${status.bg}`}>
          {status.dot && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
          {status.label}
        </span>
      </div>

      {/* Players + Score */}
      <div className="flex items-center">
        {/* Home player */}
        <PlayerColumn
          participant={home}
          isWinner={home?.isWinner === true}
          isLoser={isFinished && home?.isWinner === false && hasWinner}
        />

        {/* Central score */}
        <div className="flex flex-col items-center px-2" style={{ minWidth: 90 }}>
          {match.status === "scheduled" && !hasScore ? (
            <span className="text-4xl font-black text-muted-foreground/30">VS</span>
          ) : (
            <>
              <span className="text-5xl font-black tabular-nums">{score.home}-{score.away}</span>
              {hasScore && <span className="mt-1 text-[10px] font-bold tracking-widest text-muted-foreground">SETS</span>}
            </>
          )}
        </div>

        {/* Away player */}
        <PlayerColumn
          participant={away}
          isWinner={away?.isWinner === true}
          isLoser={isFinished && away?.isWinner === false && hasWinner}
        />
      </div>

      {/* Context line */}
      <div className="space-y-2.5">
        <div className="h-px bg-border" />
        <div className="text-center text-xs text-muted-foreground">
          {match.status === "scheduled" && match.scheduledAt && formatDateFull(match.scheduledAt)}
          {match.status === "ongoing" && match.startedAt && `Depuis ${new Date(match.startedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
          {match.status === "finished" && duration && (
            <span className="inline-flex items-center gap-1">
              <Timer className="size-3" />
              {duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerColumn({ participant, isWinner, isLoser }: { participant?: MatchParticipant; isWinner: boolean; isLoser: boolean }) {
  const name = participant?.user?.name ?? "Joueur";
  const image = participant?.user?.image;
  const initial = name.charAt(0);

  return (
    <div className={`flex flex-1 flex-col items-center gap-2 ${isLoser ? "opacity-60" : ""}`}>
      <div className="relative">
        <Avatar className="size-16">
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">{initial}</AvatarFallback>
        </Avatar>
        {isWinner && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base">👑</span>}
      </div>
      <span className="text-sm font-semibold text-center leading-tight">{name.split(" ")[0]}</span>
    </div>
  );
}

// --- Live Timer Card ---

function LiveTimerCard({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const formatted = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border-2 border-red-500/30 bg-card p-4 text-center space-y-2">
      <div className="flex items-center justify-center gap-1.5">
        <span className="size-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-semibold text-red-600">En cours</span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <Timer className="size-4 text-muted-foreground" />
        <span className="text-3xl font-bold tabular-nums">{formatted}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">Temps de jeu</p>
    </div>
  );
}

// --- Sets Card ---

function SetsCard({ sets, home, away }: { sets: MatchSet[]; home?: MatchParticipant; away?: MatchParticipant }) {
  const sorted = [...sets].sort((a, b) => a.setNumber - b.setNumber);
  const homeName = home?.user?.name?.split(" ")[0] ?? "Joueur 1";
  const awayName = away?.user?.name?.split(" ")[0] ?? "Joueur 2";

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground px-1">SCORES PAR SET</p>

      {sorted.map((set) => {
        const hs = set.scores.find((s) => s.side === "home")?.games ?? 0;
        const as_ = set.scores.find((s) => s.side === "away")?.games ?? 0;
        const homeWins = hs > as_;
        const awayWins = as_ > hs;

        return (
          <div key={set.id} className="rounded-2xl border bg-card p-4 space-y-4">
            <p className="text-sm font-semibold">Set {set.setNumber}</p>
            <div className="flex items-center gap-3">
              {/* Home */}
              <div className="flex-1 space-y-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  {homeWins && <ChevronRight className="size-3 text-blue-500" />}
                  <span className={`text-xs ${homeWins ? "font-medium text-foreground" : "text-muted-foreground"}`}>{homeName}</span>
                </div>
                <div className={`mx-auto rounded-xl bg-muted py-3 text-2xl font-bold tabular-nums ${homeWins ? "ring-1 ring-blue-500/30" : ""}`}>
                  {hs}
                </div>
              </div>

              <span className="text-[10px] font-bold text-muted-foreground/50">VS</span>

              {/* Away */}
              <div className="flex-1 space-y-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  {awayWins && <ChevronRight className="size-3 text-orange-500" />}
                  <span className={`text-xs ${awayWins ? "font-medium text-foreground" : "text-muted-foreground"}`}>{awayName}</span>
                </div>
                <div className={`mx-auto rounded-xl bg-muted py-3 text-2xl font-bold tabular-nums ${awayWins ? "ring-1 ring-orange-500/30" : ""}`}>
                  {as_}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Info Card ---

function InfoCard({ match }: { match: Match }) {
  const duration = getDuration(match.startedAt, match.finishedAt);
  const typeLabel = getTypeLabel(match.type);
  const isTraining = match.type === "training";

  const rows: { icon: React.ReactNode; label: string; value: string; color?: string }[] = [];

  rows.push({
    icon: <Swords className="size-3.5" />,
    label: "Type",
    value: typeLabel,
    color: isTraining ? "text-orange-500" : "text-blue-500",
  });

  if (match.scheduledAt) {
    rows.push({ icon: <Calendar className="size-3.5" />, label: "Date prévue", value: formatDateFull(match.scheduledAt) });
  }

  if (match.startedAt) {
    rows.push({ icon: <PlayCircle className="size-3.5" />, label: "Démarré le", value: formatDateFull(match.startedAt) });
  }

  if (match.finishedAt) {
    rows.push({ icon: <CheckCircle className="size-3.5" />, label: "Terminé le", value: formatDateFull(match.finishedAt) });
  }

  if (duration) {
    rows.push({ icon: <Timer className="size-3.5" />, label: "Durée", value: duration });
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground px-4 pt-4 pb-2">INFORMATIONS</p>
      <div className="px-4 pb-4">
        {rows.map((row, i) => (
          <div key={row.label}>
            {i > 0 && <div className="h-px bg-border/50" />}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                {row.icon}
                <span className="text-sm">{row.label}</span>
              </div>
              <span className={`text-sm ${row.color ?? ""}`}>{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Comments Card ---

function CommentsCard({
  matchId,
  comments,
  currentUserId,
  isParticipant,
}: {
  matchId: string;
  comments: MatchComment[];
  currentUserId: string;
  isParticipant: boolean;
}) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment(matchId);
  const hasUserCommented = comments.some((c) => c.userId === currentUserId);
  const sorted = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync({ content: content.trim() });
    setContent("");
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground px-4 pt-4 pb-2">COMMENTAIRES</p>

      <div className="px-4 pb-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <MessageCircle className="size-7 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucun commentaire</p>
          </div>
        ) : (
          <div>
            {sorted.map((comment, i) => (
              <div key={comment.id}>
                {i > 0 && <div className="h-px bg-border/50" />}
                <div className="flex gap-3 py-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={comment.userImage ?? undefined} />
                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{comment.userName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(comment.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add comment form */}
        {!hasUserCommented && isParticipant && (
          <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="min-h-9 resize-none text-sm"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={!content.trim() || createComment.isPending} className="shrink-0">
              <Send className="size-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// --- Score Editor Dialog ---

interface EditableSet {
  key: number;
  setNumber: number;
  homeScore: number;
  awayScore: number;
}

function ScoreEditorDialog({
  open,
  onOpenChange,
  matchId,
  sets,
  home,
  away,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  sets: MatchSet[];
  home: MatchParticipant;
  away: MatchParticipant;
}) {
  const updateScores = useUpdateMatchScores(matchId);
  const [editedSets, setEditedSets] = useState<EditableSet[]>([]);
  const [keyCounter, setKeyCounter] = useState(100);

  const homeName = home.user?.name?.split(" ")[0] ?? "Joueur 1";
  const awayName = away.user?.name?.split(" ")[0] ?? "Joueur 2";
  const homeUserId = home.userId;
  const awayUserId = away.userId;

  // Initialize edited sets when dialog opens
  useEffect(() => {
    if (open) {
      if (sets.length > 0) {
        const sorted = [...sets].sort((a, b) => a.setNumber - b.setNumber);
        setEditedSets(
          sorted.map((s, i) => ({
            key: i,
            setNumber: s.setNumber,
            homeScore: s.scores.find((sc) => sc.side === "home")?.games ?? 0,
            awayScore: s.scores.find((sc) => sc.side === "away")?.games ?? 0,
          })),
        );
        setKeyCounter(sorted.length);
      } else {
        setEditedSets([{ key: 0, setNumber: 1, homeScore: 0, awayScore: 0 }]);
        setKeyCounter(1);
      }
    }
  }, [open, sets]);

  // Compute global score
  let homeSetsWon = 0;
  let awaySetsWon = 0;
  for (const s of editedSets) {
    if (s.homeScore > s.awayScore) homeSetsWon++;
    else if (s.awayScore > s.homeScore) awaySetsWon++;
  }

  function updateSetScore(key: number, field: "homeScore" | "awayScore", delta: number) {
    setEditedSets((prev) =>
      prev.map((s) => {
        if (s.key !== key) return s;
        const newVal = Math.max(0, Math.min(99, s[field] + delta));
        return { ...s, [field]: newVal };
      }),
    );
  }

  function addSet() {
    const nextNum = (editedSets.at(-1)?.setNumber ?? 0) + 1;
    setEditedSets((prev) => [...prev, { key: keyCounter, setNumber: nextNum, homeScore: 0, awayScore: 0 }]);
    setKeyCounter((c) => c + 1);
  }

  function removeSet(key: number) {
    setEditedSets((prev) => {
      const filtered = prev.filter((s) => s.key !== key);
      // Re-number
      return filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    });
  }

  async function handleSave() {
    const data = {
      sets: editedSets.map((s) => ({
        setNumber: s.setNumber,
        scores: [
          { userId: homeUserId, score: s.homeScore },
          { userId: awayUserId, score: s.awayScore },
        ],
      })),
    };

    await updateScores.mutateAsync(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier les scores</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Global score header */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="flex flex-col items-center gap-1">
              <Avatar className="size-12">
                <AvatarImage src={home.user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">{homeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{homeName}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums">{homeSetsWon} - {awaySetsWon}</span>
              <span className="text-[10px] text-muted-foreground">Sets</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Avatar className="size-12">
                <AvatarImage src={away.user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">{awayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{awayName}</span>
            </div>
          </div>

          {/* Editable sets */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {editedSets.map((s) => (
              <div key={s.key} className="rounded-xl border bg-card p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Set {s.setNumber}</span>
                  {editedSets.length > 1 && (
                    <button type="button" onClick={() => removeSet(s.key)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Home score */}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1.5 text-center">{homeName}</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSetScore(s.key, "homeScore", -1)}
                        className="flex size-8 items-center justify-center rounded-lg border bg-muted hover:bg-accent transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xl font-bold tabular-nums">{s.homeScore}</span>
                      <button
                        type="button"
                        onClick={() => updateSetScore(s.key, "homeScore", 1)}
                        className="flex size-8 items-center justify-center rounded-lg border bg-muted hover:bg-accent transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-muted-foreground/50 pt-5">VS</span>

                  {/* Away score */}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1.5 text-center">{awayName}</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateSetScore(s.key, "awayScore", -1)}
                        className="flex size-8 items-center justify-center rounded-lg border bg-muted hover:bg-accent transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xl font-bold tabular-nums">{s.awayScore}</span>
                      <button
                        type="button"
                        onClick={() => updateSetScore(s.key, "awayScore", 1)}
                        className="flex size-8 items-center justify-center rounded-lg border bg-muted hover:bg-accent transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add set button */}
          {editedSets.length < 5 && (
            <button
              type="button"
              onClick={addSet}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="size-4" />
              Ajouter un set
            </button>
          )}

          {/* Save button */}
          <Button onClick={handleSave} disabled={updateScores.isPending} className="w-full gap-2">
            {updateScores.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
