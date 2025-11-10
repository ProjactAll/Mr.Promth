"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { LogOut, PanelsTopLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard" },
  { name: "Chat", href: "/app/chat/default" },
  { name: "Prompts", href: "/app/prompts" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_45%),_linear-gradient(180deg,_rgba(16,185,129,0.08),_transparent_55%)]">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
                MP
              </span>
              <div>
                <Link href="/app/dashboard" className="text-lg font-semibold text-foreground">
                  Mr.Promth
                </Link>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">From Prompt to Production</p>
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 rounded-full border border-border/80 bg-background/60 px-3 py-1.5 shadow-sm md:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-sm font-semibold text-secondary-foreground">
                  AJ
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Avery Johnson</p>
                  <p className="text-xs text-muted-foreground">Product Lead</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden gap-2 md:inline-flex"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <PanelsTopLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
