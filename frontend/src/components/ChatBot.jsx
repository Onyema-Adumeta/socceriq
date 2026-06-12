import { useState, useRef, useEffect } from "react";
import useChat from "../hooks/useChat";

const QUICK_QUESTIONS = ["Who is Messi?", "Who won World Cup 2022?", "Champions League records?", "Give me a hint"];

export default function ChatBot({ sessionId }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isTyping, sendMessage, clearChat } = useChat();
  const bottomRef = useRef(null);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  const handleSend = () => { if (!input.trim()) return; sendMessage(input, sessionId); setInput(""); };
  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  return (
    <div className="chatbot-container">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-name">SoccerBot AI</span>
              <div className="chatbot-status">{isTyping ? <span className="typing-indicator">typing...</span> : <span className="online">online</span>}</div>
            </div>
            <div className="chatbot-actions">
              <button className="chatbot-clear" onClick={clearChat}>Clear</button>
              <button className="chatbot-close" onClick={() => setOpen(false)}>X</button>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={"chat-msg chat-msg--" + msg.role}>
                <div className="chat-bubble">{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className="chat-msg chat-msg--assistant"><div className="chat-bubble chat-bubble--typing"><span></span><span></span><span></span></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-quick">
            {QUICK_QUESTIONS.map((q, i) => <button key={i} className="quick-btn" onClick={() => sendMessage(q, sessionId)}>{q}</button>)}
          </div>
          <div className="chatbot-input">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask about soccer..." className="chat-input" maxLength={200} />
            <button className="chat-send" onClick={handleSend} disabled={!input.trim() || isTyping}>Send</button>
          </div>
        </div>
      )}
      <button className={"chatbot-toggle" + (open ? " chatbot-toggle--open" : "")} onClick={() => setOpen(o => !o)}>
        {open ? "Close" : "AI Chat"}
      </button>
    </div>
  );
}