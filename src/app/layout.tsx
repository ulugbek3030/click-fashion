import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Click Fashion",
  description: "Fashion e-commerce for Uzbekistan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
