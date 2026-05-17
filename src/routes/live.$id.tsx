import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/live/$id")({
  component: PublicLive,
  head: () => ({ meta: [{ title: "Live cricket • CrickArena" }, { name: "description", content: "Follow this match ball-by-ball, live." }] }),
});

function PublicLive() {
  const { id } = Route.useParams();
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any[]>([]);
  const [balls, setBalls] = useState<any[]>([]);
  const [flash, setFlash] = useState(false);

  const load = useCallback(async () => {
    const { data: m } = await supabase.from("matches").select("*, tournaments(name), team_a:teams!matches_team_a_id_fkey(id,name,short_name), team_b:teams!matches_team_b_id_fkey(id,name,short_name)").eq("id", id).maybeSingle();
    setMatch(m);
    if (!m) return;
    const [{ data: inn }, { data: b }] = await Promise.all([
      supabase.from("innings").select("*").eq("match_id", id).order("innings_no"),
      supabase.from("balls").select("*").eq("match_id", id).order("created_at"),
    ]);
    setInnings(inn ?? []); setBalls(b ?? []);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel(`live:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "balls", filter: `match_id=eq.${id}` }, () => { load(); setFlash(true); setTimeout(() => setFlash(false), 600); })
      .on("postgres_changes", { event: "*", schema: "public", table: "innings", filter: `match_id=eq.${id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  if (!match) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-3 px-4 text-center text-xs font-medium opacity-90">{match.tournaments?.name}</header>
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        {innings.map((cur) => {
          const battingTeam = match.team_a_id === cur.batting_team_id ? match.team_a : match.team_b;
          const bowlingTeam = match.team_a_id === cur.bowling_team_id ? match.team_a : match.team_b;
          const inningsBalls = balls.filter((b) => b.innings_no === cur.innings_no);
          const legalBalls = inningsBalls.filter((b) => b.extra_type !== "wide" && b.extra_type !== "no_ball").length;
          const overNo = Math.floor(legalBalls / 6);
          const ballInOver = legalBalls % 6;
          const rr = legalBalls > 0 ? ((cur.runs * 6) / legalBalls).toFixed(2) : "0.00";
          const isCurrent = cur.innings_no === match.current_innings;
          const recent = inningsBalls.slice(-12);
          return (
            <div key={cur.id} className="rounded-2xl bg-card border overflow-hidden">
              <div className={`p-5 ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="flex items-center justify-between text-xs font-medium opacity-90">
                  <span>INNINGS {cur.innings_no} • {match.overs} OV</span>
                  {isCurrent && match.status === "live" && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> LIVE</span>}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs opacity-70">BATTING</div>
                    <div className="font-display text-lg font-bold">{battingTeam?.name}</div>
                  </div>
                  <div className={`text-right tabular ${flash && isCurrent ? "score-flash" : ""}`}>
                    <div className="font-display text-4xl font-bold">{cur.runs}<span className="text-xl opacity-70">/{cur.wickets}</span></div>
                    <div className="text-xs opacity-80 mt-1">{overNo}.{ballInOver} ov • RR {rr}</div>
                  </div>
                </div>
              </div>
              {isCurrent && (
                <div className="p-5">
                  <div className="text-xs text-muted-foreground mb-2">vs {bowlingTeam?.name} • Recent balls</div>
                  <div className="flex gap-1.5 tabular flex-wrap">
                    {recent.length === 0 && <div className="text-sm text-muted-foreground">No balls bowled yet.</div>}
                    {recent.map((b, i) => {
                      const label = b.is_wicket ? "W" : b.extra_type === "wide" ? `${b.runs+1}wd` : b.extra_type === "no_ball" ? `${b.runs+1}nb` : b.runs === 0 ? "•" : String(b.runs);
                      const cls = b.is_wicket ? "bg-destructive text-destructive-foreground" : b.runs === 6 ? "bg-warning text-warning-foreground" : b.runs === 4 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground";
                      return <div key={i} className={`grid min-w-9 h-9 px-2 place-items-center rounded-full text-sm font-bold ${cls}`}>{label}</div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
