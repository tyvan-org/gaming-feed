import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gaming Feed",
  description: "A fast, readable feed for gaming news articles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
