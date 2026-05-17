import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export const Route = createFileRoute("/teams")({ component: TeamsPage });

function TeamsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("teams")
        .select("*, players(count), tournaments!inner(name, organizer_id)")
        .eq("tournaments.organizer_id", u.user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
    })();
  }, []);
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold mb-1">Teams</h1>
      <p className="text-muted-foreground mb-8">All teams across your tournaments.</p>
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No teams yet. Add teams from inside a tournament.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <Link key={t.id} to="/teams/$id" params={{ id: t.id }} className="rounded-xl border bg-card p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground text-xs font-bold">{t.short_name || t.name.slice(0, 3).toUpperCase()}</div>
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.tournaments?.name}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">{t.players?.[0]?.count ?? 0} players</div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
