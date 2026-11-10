import { SidebarProvider } from '@/components/ui/sidebar';
import '@/app/globals.css';

import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/header';
import { ImpersonationBanner } from '@/components/admin/impersonation-banner';
import { getSession } from '@/lib/session';

const title = 'Admin Page';
const description = '';

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        {session?.session.impersonatedBy && (
          <ImpersonationBanner email={session.user.email} />
        )}
        <Header />
        {children}
      </main>
    </SidebarProvider>
  );
}
