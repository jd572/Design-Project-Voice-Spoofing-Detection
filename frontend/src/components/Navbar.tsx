'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Mic,
  History,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Tooltip from './Tooltip';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Go to your dashboard' },
  { href: '/upload', label: 'Upload', icon: Upload, tooltip: 'Upload an audio file to analyze' },
  { href: '/record', label: 'Record', icon: Mic, tooltip: 'Record audio using your microphone' },
  { href: '/history', label: 'History', icon: History, tooltip: 'View your detection history' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Only use Clerk components if the publishable key is available
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const NavLinks = () => (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Tooltip key={link.href} text={link.tooltip} position="bottom">
            <Link
              href={link.href}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-950/50 rounded-lg border border-primary-200 dark:border-primary-800/50 -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </Link>
          </Tooltip>
        );
      })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-surface-900/80 border-b border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              VoiceGuard AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {hasClerk ? (
              <SignedIn>
                <NavLinks />
              </SignedIn>
            ) : (
              <NavLinks />
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Tooltip text={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} position="bottom">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </Tooltip>

            {hasClerk ? (
              <>
                <SignedIn>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: { avatarBox: 'w-9 h-9 ring-2 ring-primary-500/30' },
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in" className="btn-primary text-sm !px-4 !py-2">
                    Sign In
                  </Link>
                </SignedOut>
              </>
            ) : (
              <span className="text-xs text-surface-400 hidden sm:block">No Auth</span>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4 border-t border-surface-200 dark:border-surface-800 mt-2"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
