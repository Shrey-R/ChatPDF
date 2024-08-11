import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/Navbar";
import Providers from "@/components/Providers";
import 'react-loading-skeleton/dist/skeleton.css'
import { Toaster } from "@/components/ui/toaster";
import 'simplebar-react/dist/simplebar.min.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat PDF",
  description: "Chat PDF allows you to have conversation with any PDF document",
  icons: "/favicon.ico"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body className={cn(
          'min-h-screen font-sans antialiased grainy',
          inter.className
        )}>
          <Toaster/>
          <Navbar/>
          {children}
          </body>
        </Providers>
    </html>
  );
}
