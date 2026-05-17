import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Plus } from "lucide-react";

export const Route = createFileRoute("/matches")({ component: MatchesPage });

function MatchesPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("matches")
        .select("*, tournaments!inner(name, organizer_id), team_a:teams!matches_team_a_id_fkey(name, short_name), team_b:teams!matches_team_b_id_fkey(name, short_name)")
        .eq("tournaments.organizer_id", u.user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
    })();
  }, []);
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-display text-3xl font-bold">Matches</h1><p className="text-muted-foreground mt-1">All scheduled, live and completed matches.</p></div>
        <Link to="/matches/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent"><Plus className="h-4 w-4" /> New match</Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Radio className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No matches yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((m) => (
            <Link key={m.id} to="/matches/$id" params={{ id: m.id }} className="rounded-xl border bg-card p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground">{m.tournaments?.name}</div>
                {m.status === "live" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />LIVE</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted capitalize">{m.status}</span>
                )}
              </div>
              <div className="font-display font-semibold">{m.team_a?.name} <span className="text-muted-foreground">vs</span> {m.team_b?.name}</div>
              <div className="mt-2 text-xs text-muted-foreground tabular">{m.overs} overs</div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
