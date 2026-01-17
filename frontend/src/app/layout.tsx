import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ThemeRegistry from "../providers/ThemeRegistry";
import QueryProvider from "../providers/QueryProvider";
import ReduxProvider from "../providers/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMS",
  description: "Event Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <QueryProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
