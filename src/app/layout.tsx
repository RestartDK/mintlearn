import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MintLearn",
  description: "Generate quizzes with mistral",
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
        <p className="text-lg flex items-center gap-x-2 font-extrabold px-20 py-4">
          <Image
            src="/mintlearn-logo.svg"
            width={30}
            height={30}
            alt="MintLearn logo"
          />
          MintLearn
        </p>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
