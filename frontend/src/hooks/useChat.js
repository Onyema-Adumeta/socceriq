import { useState, useCallback } from "react";
import { chatAPI } from "../api";

export default function useChat() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hey! I am SoccerBot, your AI soccer assistant! Ask me anything about football or get hints during the game!", timestamp: Date.now() }]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text, sessionId = null) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: Date.now() }]);
    setIsTyping(true);
    try {
      const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
      const data = await chatAPI.sendMessage(text, history, sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Having a quick timeout. Try again!", timestamp: Date.now(), error: true }]);
    } finally { setIsTyping(false); }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([{ role: "assistant", content: "Chat cleared! What would you like to know about soccer?", timestamp: Date.now() }]);
  }, []);

  return { messages, isTyping, sendMessage, clearChat };
}