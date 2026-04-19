import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainHeader from "./components/main-header";
import { DialogProvider } from "./components/ui/dialog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'YOPI LAND',
  description: '개발자 요피의 실험실이자 다양한 서비스 놀이터',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico', // 나중에 전용 apple-touch-icon.png 추가 가능
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DialogProvider>
          <MainHeader />
          <main className="flex-1">
            {children}
          </main>
        </DialogProvider>
      </body>
    </html>
  );
}
