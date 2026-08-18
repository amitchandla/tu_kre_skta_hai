import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BizGrow AI — Your AI Business Growth Assistant",
  description:
    "BizGrow AI understands your business and helps you decide what to do next — from customers and follow-ups to social media, videos and advertising.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
