import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, ArrowRight } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container-modern flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-primary p-2 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-gradient-primary">MR.Promth</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium hover:text-primary transition-smooth">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-smooth">
            How it Works
          </Link>
          <Link href="/#agents" className="text-sm font-medium hover:text-primary transition-smooth">
            AI Agents
          </Link>
          <Link href="/docs" className="text-sm font-medium hover:text-primary transition-smooth">
            Docs
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-smooth">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-smooth">
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="transition-smooth hover:scale-105">
              เข้าสู่ระบบ
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" className="btn-primary gap-2">
               แชท AI
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
