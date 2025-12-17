import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="grid place-items-center h-dvh w-full bg-deep-space relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="z-10 w-full px-4 flex justify-center">
        <ChatInterface />
      </div>
    </main>
  );
}
