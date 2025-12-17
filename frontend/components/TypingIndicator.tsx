import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-full glass-panel bg-blue-500/20">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-300"
        >
          <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        </svg>
      </div>
      <div className="glass-panel px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center h-[46px]">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: dot * 0.2,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}