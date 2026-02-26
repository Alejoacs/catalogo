import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import LayoutClient from "./LayoutClient";
import { CatalogProvider } from "@/context/CatalogContext";

export const metadata: Metadata = {
  title: {
    default: "Home",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="es">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <CatalogProvider>
              <LayoutClient>
                <main className="container mx-auto max-w-7xl pt-8 px-6 flex-grow">
                  {children}
                </main>
              </LayoutClient>
            </CatalogProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}