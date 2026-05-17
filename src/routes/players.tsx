import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserSquare2 } from "lucide-react";

export const Route = createFileRoute("/players")({ component: PlayersPage });

function PlayersPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("players")
        .select("*, teams!inner(id, name, short_name, tournaments!inner(organizer_id))")
        .eq("teams.tournaments.organizer_id", u.user.id)
        .order("name");
      setItems(data ?? []);
    })();
  }, []);
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold mb-1">Players</h1>
      <p className="text-muted-foreground mb-8">All players across your tournaments.</p>
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <UserSquare2 className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No players yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left p-4">Player</th><th className="text-left p-4">Team</th><th className="text-left p-4">Role</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 font-medium">{p.name} {p.jersey_number ? <span className="text-muted-foreground tabular">#{p.jersey_number}</span> : null}</td>
                  <td className="p-4">
                    <Link to="/teams/$id" params={{ id: p.teams.id }} className="hover:underline">{p.teams.name}</Link>
                  </td>
                  <td className="p-4 capitalize text-muted-foreground">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
