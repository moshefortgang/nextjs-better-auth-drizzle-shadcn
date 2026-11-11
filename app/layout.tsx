import './globals.css';

import { GeistSans } from 'geist/font/sans';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const title = 'Next.js + Postgres Auth Starter';
const description =
  'This is a Next.js starter kit that uses Better Auth for simple email + password login and a Postgres database to persist the data.';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  metadataBase: new URL('https://nextjs-postgres-auth.vercel.app'),
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
