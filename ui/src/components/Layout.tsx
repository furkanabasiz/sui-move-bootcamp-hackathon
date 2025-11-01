import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import WalletButton from './WalletButton';
import { Vote } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Vote className="w-6 h-6 text-primary" />
              <span>Sui Voting</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-sm font-medium hover:text-primary transition"
              >
                Polls
              </Link>
              <Link
                to="/create"
                className="text-sm font-medium hover:text-primary transition"
              >
                Create
              </Link>
            </nav>

            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built on Sui Blockchain • Decentralized Voting dApp</p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://sui.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sui
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}