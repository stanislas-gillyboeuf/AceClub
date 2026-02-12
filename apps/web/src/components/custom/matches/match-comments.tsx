"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useCreateComment } from "@/hooks/use-match-mutations";
import type { MatchComment } from "@/types/match";

interface MatchCommentsProps {
  matchId: string;
  comments: MatchComment[];
}

export function MatchComments({ matchId, comments }: MatchCommentsProps) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment(matchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync({ content: content.trim() });
    setContent("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Commentaires ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar className="size-7 shrink-0">
              <AvatarImage src={comment.userImage ?? undefined} />
              <AvatarFallback className="text-[10px]">{comment.userName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{comment.userName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-9 resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={!content.trim() || createComment.isPending}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
