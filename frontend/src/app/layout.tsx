import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'VoiceGuard AI - Voice Spoofing Detection',
  description:
    'Detect spoofed and synthetic voice audio using advanced deep learning. Powered by CNN-LSTM models trained on the ASVspoof dataset.',
  keywords: 'voice spoofing, audio detection, deepfake, AI, ASVspoof, voice authentication',
};

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                borderRadius: '12px',
                border: '1px solid #334155',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey) {
    // Run without Clerk auth when no key is configured
    return <AppShell>{children}</AppShell>;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0f172a',
          colorText: '#f1f5f9',
          borderRadius: '0.75rem',
        },
      }}
    >
      <AppShell>{children}</AppShell>
    </ClerkProvider>
  );
}
