import { useState, useCallback } from "react";
import type { ChatMessage } from "../types";

export function useReplyState() {
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const startReply = useCallback((msg: ChatMessage) => {
    setReplyingTo(msg);
  }, []);

  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  return {
    replyingTo,
    setReplyingTo: startReply,
    clearReply,
  };
}
