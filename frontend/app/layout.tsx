import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/query-provider";
import FetchUserDetails from "@/fetchUserDetails";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Inter, Instrument_Sans } from "next/font/google";
import { cn } from "@/utils/cn";
import  ProgressBar  from "@/components/ProgressBarLoader";
import { Suspense } from "react";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Instrument_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProfessorAI",
  description: "Generate Quizes and Tests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cn(
          "min-h-screen flex flex-col font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )} bg-background text-foreground`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Suspense>
            <ProgressBar />
            </Suspense>
            
            <FetchUserDetails />
            <Navbar />
            {/* <Header /> */}
            <main className="pt-4">
              {children}
            </main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}