import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "LifeLine Agent — Emergency Handoff Board",
  description: "Demo clinical handoff board for emergency dispatch review",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <body className="bg-[#f7f3ea] text-[#142433] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
