import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Globe, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const items = [
    { label: "Leads", path: "/admin", icon: LayoutDashboard },
    { label: "Public site", path: "/", icon: Globe },
  ];
  return (
    <nav className="flex flex-col gap-1 px-4">
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              active
                ? "border-white bg-white/10 font-medium text-white"
                : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh">
        <div className="hidden w-60 bg-cobalt md:block" />
        <div className="flex-1 space-y-4 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
        <div className="w-full max-w-sm border border-border bg-white p-8">
          <p className="micro-label text-muted-foreground">Restricted area</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lead data is private. Sign in with the admin account to open the
            dashboard.
          </p>
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => (window.location.href = LOGIN_PATH)}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper p-6">
        <div className="w-full max-w-sm border border-border bg-white p-8">
          <p className="micro-label text-destructive">Access denied</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Admin role required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You're signed in as {user.name || user.email}, but this account
            doesn't have the admin role needed to manage leads.
          </p>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  const logoBlock = (
    <div className="flex h-16 items-center gap-2.5 px-6">
      <span className="flex h-7 w-7 items-center justify-center bg-white font-mono text-sm font-semibold text-cobalt">
        L
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-white">
          LeadDesk
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
          Client CRM
        </p>
      </div>
    </div>
  );

  const sidebarInner = (showLogo: boolean) => (
    <>
      {showLogo && logoBlock}
      <div className="mt-4">
        <p className="micro-label px-7 pb-2 text-white/50">Workspace</p>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </div>
      <div className="mt-auto p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-h-11 w-full items-center gap-3 px-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/15 font-mono text-sm text-white">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {user.name || "Admin"}
                </span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                  Administrator
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-paper">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-cobalt md:flex">
        {sidebarInner(true)}
      </aside>

      {/* Mobile header + drawer */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-cobalt px-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center bg-white font-mono text-sm font-semibold text-cobalt">
            L
          </span>
          <span className="text-sm font-semibold text-white">LeadDesk</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-cobalt pt-14">
            {sidebarInner(false)}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-16 pt-[4.5rem] md:px-10 md:pt-10">
        {children}
      </main>
    </div>
  );
}
