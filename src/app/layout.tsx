import type { Metadata, Viewport } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/stores/authContext';
import { SocialProvider } from '@/stores/socialContext';
import { ChatProvider } from '@/stores/chatContext';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AfriLink | Africa’s Social Network, Built for Africans',
  description:
    'The digital social infrastructure connecting African people, communities, creators, and businesses across borders.',
  keywords: ['AfriLink', 'African Social Network', 'Pan-African', 'AfroTech', 'Discover Africa'],
  authors: [{ name: 'AfriLink Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AfriLink',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#087443',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable} suppressHydrationWarning>
      <body className="antialiased font-sans bg-[#F5F7F6] dark:bg-[#0B130E] text-neutral-900 dark:text-[#F5F7F6] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <OfflineBanner />
          <AuthProvider>
            <SocialProvider>
              <ChatProvider>
                <AppShell>{children}</AppShell>
              </ChatProvider>
            </SocialProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
