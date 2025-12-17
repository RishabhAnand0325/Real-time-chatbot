import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tecnvirons AI Backend",
  description: "Real-time AI Chat with WebSockets and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
