import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-64px)]">
      <SignUp
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
