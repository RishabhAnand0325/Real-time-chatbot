import type { Metadata } from "next";
import "./globals.css";

// We removed the 'next/font/google' import to prevent the connection error.

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
      {/* We use 'antialiased' for smoother text rendering 
        and 'font-sans' to use the default system font stack (Inter-like).
      */}
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}