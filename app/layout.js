import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinAllytics",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className}`} suppressHydrationWarning={true}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="premium-bg py-12 border-t premium-border">
            <div className="container mx-auto px-4 text-center premium-text">
              <p>Made with 💗 by Shriyash</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
