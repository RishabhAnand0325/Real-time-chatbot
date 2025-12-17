import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

interface MessageProps {
  role: "user" | "ai";
  content: string;
}

export default function MessageBubble({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className={`p-2 rounded-full glass-panel ${isUser ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div
        className={`relative px-5 py-3 rounded-2xl max-w-[70%] text-sm leading-relaxed tracking-wide shadow-lg transition-all duration-300 hover:scale-[1.01] 
        ${isUser 
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none" 
          : "glass-panel text-gray-100 rounded-bl-none border-t border-l border-white/10"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}