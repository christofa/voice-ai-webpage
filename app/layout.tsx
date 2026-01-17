import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";




export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// const Footer = () => {
//   const currentYear = new Date().getFullYear(); 
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl flex-grow">
              {children}
            </main>
           <footer className="w-full py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        
        {/* Copyright Detail */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {currentYear} <span className="font-semibold text-primary">EchoBase</span>. 
          All rights reserved.
        </p>

        {/* Optional: Secondary Links */}
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="/privacy" className="text-sm text-gray-500 hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm text-gray-500 hover:text-primary transition-colors">
            Terms of Service
          </a>
        </div>
        
      </div>
    </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
