import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Chess",
  description: "Real-time 3D multiplayer chess",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
