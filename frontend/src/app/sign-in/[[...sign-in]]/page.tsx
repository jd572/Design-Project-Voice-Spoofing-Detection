import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-64px)]">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white dark:bg-surface-800 shadow-2xl border border-surface-200 dark:border-surface-700',
          },
        }}
      />
    </div>
  );
}
