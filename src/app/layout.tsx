import "@fontsource-variable/outfit";
import "@fontsource/playfair-display/700-italic.css";
import "@fontsource/playfair-display/600.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "NIHA ISLAND", description: "Experience the villa at ICON — a birthday reality-show game night." };
export const viewport: Viewport = { themeColor: "#06344d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
