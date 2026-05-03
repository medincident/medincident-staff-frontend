import { Geist } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/lib/constants";
import { Metadata, Viewport } from "next";
import { THEME_COLORS } from "@/lib/constants";
import { ThemeColorManager } from "@/components/providers/theme-color-manager";
import { AccessibilityInit } from "@/components/providers/accessibility-init";
import { MiniAppInit } from "@/components/providers/miniapp-init";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { ApiProvider } from "@/components/providers/api-provider";

const geistSans = Geist({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONFIG.name}`,
    default: APP_CONFIG.name,
  },
  description: APP_CONFIG.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <MiniAppInit />
          <ServiceWorkerRegister />
          <InstallPrompt />
          <ThemeColorManager />
          <AccessibilityInit />
          <NextAuthSessionProvider>
            <ApiProvider>
            {children}
            </ApiProvider>
          </NextAuthSessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}