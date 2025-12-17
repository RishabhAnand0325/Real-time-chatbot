"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/ws/session/user_123");

    ws.onopen = () => console.log("Connected to AI Backend");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "token") {
        setIsTyping(false);
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "ai") {
            return [...prev.slice(0, -1), { ...lastMsg, content: lastMsg.content + data.content }];
          } else {
            return [...prev, { role: "ai", content: data.content }];
          }
        });
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const scrollToBottom = () => {
    // UPDATED: 'block: nearest' prevents the whole page from jumping if the chat is tall
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setIsTyping(true);
    socket.send(input);
    setInput("");
  };

  return (
    // UPDATED: Fixed height to 75vh and max-width-5xl for a balanced "floating" look
    <div className="flex flex-col h-[75vh] w-full max-w-5xl glass-panel rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
             <Sparkles className="text-purple-400 w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-wide">
            Realtime AI Nexus
          </h2>
        </div>
        <div className="flex gap-2 opacity-50">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></span>
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-white/30 space-y-4">
            <Sparkles className="w-12 h-12 text-white/10" />
            <p className="font-light tracking-wider">Initialize the sequence...</p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
        </AnimatePresence>

        {isTyping && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9 }}
           >
             <TypingIndicator />
           </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-lg shrink-0">
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="w-full glass-input rounded-xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20 font-light"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="absolute right-2 p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}