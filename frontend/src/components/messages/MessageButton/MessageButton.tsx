import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createConversation } from "../../../services/api/messageApi";

import "./MessageButton.css";

interface MessageButtonProps {
  userId: string;
  compact?: boolean;
}

export default function MessageButton({
  userId,
  compact = false,
}: MessageButtonProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMessage = async () => {
    try {
      setLoading(true);
      setError("");

      const conversation = await createConversation(userId);

      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to start conversation",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-button">
      <button
  type="button"
  className={
    compact
      ? "message-button__button message-button__button--compact"
      : "message-button__button"
  }
  onClick={handleMessage}
  disabled={loading}
>
        <MessageCircle size={18} />

        {loading ? "Opening..." : "Message"}
      </button>

      {error && <span>{error}</span>}
    </div>
  );
}
