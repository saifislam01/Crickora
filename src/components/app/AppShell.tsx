import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Trophy, Users, UserSquare2, Radio, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/players", label: "Players", icon: UserSquare2 },
  { to: "/matches", label: "Matches", icon: Radio },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) {
    navigate({ to: "/login", search: { redirect: path } });
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground md:static md:flex-shrink-0">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-display font-bold">C</div>
          <span className="font-display text-lg font-bold tracking-tight">Crickora</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-2 text-xs text-sidebar-foreground/60 truncate">{user.email}</div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-primary text-primary-foreground px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary-foreground/15 font-display font-bold">C</div>
            <span className="font-display text-base font-bold tracking-tight">Crickora</span>
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-primary-foreground/10"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">{children}</main>

        {/* Mobile bottom tabs */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "scale-110")} />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
