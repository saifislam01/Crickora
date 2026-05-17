import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Users, UserSquare2, Radio } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const [stats, setStats] = useState({ tournaments: 0, teams: 0, players: 0, liveMatches: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [t, tm, pl, lm, rt] = await Promise.all([
        supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("organizer_id", u.user.id),
        supabase.from("teams").select("id, tournaments!inner(organizer_id)", { count: "exact", head: true }).eq("tournaments.organizer_id", u.user.id),
        supabase.from("players").select("id, teams!inner(tournaments!inner(organizer_id))", { count: "exact", head: true }).eq("teams.tournaments.organizer_id", u.user.id),
        supabase.from("matches").select("id, tournaments!inner(organizer_id)", { count: "exact", head: true }).eq("tournaments.organizer_id", u.user.id).eq("status", "live"),
        supabase.from("tournaments").select("id, name, status, format, created_at").eq("organizer_id", u.user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        tournaments: t.count ?? 0,
        teams: tm.count ?? 0,
        players: pl.count ?? 0,
        liveMatches: lm.count ?? 0,
      });
      setRecent(rt.data ?? []);
    })();
  }, []);

  const cards = [
    { k: "tournaments", l: "Tournaments", v: stats.tournaments, i: Trophy, to: "/tournaments" },
    { k: "teams", l: "Teams", v: stats.teams, i: Users, to: "/teams" },
    { k: "players", l: "Players", v: stats.players, i: UserSquare2, to: "/players" },
    { k: "liveMatches", l: "Live matches", v: stats.liveMatches, i: Radio, to: "/matches" },
  ];

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your tournaments, teams and matches.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.k} to={c.to} className="rounded-xl border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.l}</div>
              <c.i className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold tabular">{c.v}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent tournaments</h2>
            <Link to="/tournaments" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No tournaments yet.</p>
              <Link to="/tournaments" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent">
                Create your first tournament
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link to="/tournaments/$id" params={{ id: t.id }} className="flex items-center justify-between rounded-md p-3 hover:bg-muted">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{t.format.replace("_", " ")}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === "live" ? "bg-destructive/10 text-destructive" :
                      t.status === "completed" ? "bg-muted text-muted-foreground" :
                      "bg-success/10 text-success"
                    }`}>{t.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Quick actions</h2>
          <div className="grid gap-3">
            <Link to="/tournaments" className="rounded-md border p-4 hover:bg-muted">
              <div className="font-medium">Create tournament</div>
              <div className="text-xs text-muted-foreground mt-1">Set format, overs, and start date.</div>
            </Link>
            <Link to="/matches" className="rounded-md border p-4 hover:bg-muted">
              <div className="font-medium">Schedule a match</div>
              <div className="text-xs text-muted-foreground mt-1">Pick teams and go live with scoring.</div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
