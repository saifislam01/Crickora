import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Share2, Radio } from "lucide-react";

export const Route = createFileRoute("/matches/$id")({ component: MatchPage });

function MatchPage() {
  const { id } = Route.useParams();
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any[]>([]);
  const [balls, setBalls] = useState<any[]>([]);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [players, setPlayers] = useState<{ a: any[]; b: any[] }>({ a: [], b: [] });
  const [striker, setStriker] = useState<string>("");
  const [nonStriker, setNonStriker] = useState<string>("");
  const [bowler, setBowler] = useState<string>("");
  const [flash, setFlash] = useState(false);

  const load = useCallback(async () => {
    const { data: m } = await supabase.from("matches").select("*, tournaments(name, organizer_id), team_a:teams!matches_team_a_id_fkey(id, name, short_name), team_b:teams!matches_team_b_id_fkey(id, name, short_name)").eq("id", id).maybeSingle();
    setMatch(m);
    if (!m) return;
    const { data: u } = await supabase.auth.getUser();
    setIsOrganizer(u.user?.id === m.tournaments.organizer_id);
    const { data: inn } = await supabase.from("innings").select("*").eq("match_id", id).order("innings_no");
    setInnings(inn ?? []);
    const { data: b } = await supabase.from("balls").select("*").eq("match_id", id).order("created_at");
    setBalls(b ?? []);
    const [pa, pb] = await Promise.all([
      supabase.from("players").select("*").eq("team_id", m.team_a_id),
      supabase.from("players").select("*").eq("team_id", m.team_b_id),
    ]);
    setPlayers({ a: pa.data ?? [], b: pb.data ?? [] });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // realtime
  useEffect(() => {
    const ch = supabase.channel(`match:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "balls", filter: `match_id=eq.${id}` }, () => { load(); setFlash(true); setTimeout(() => setFlash(false), 600); })
      .on("postgres_changes", { event: "*", schema: "public", table: "innings", filter: `match_id=eq.${id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "matches", filter: `id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, load]);

  if (!match) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading match…</div>;

  const currentInnings = innings.find((i) => i.innings_no === match.current_innings) ?? innings[0];
  const battingTeam = match.team_a_id === currentInnings?.batting_team_id ? match.team_a : match.team_b;
  const bowlingTeam = match.team_a_id === currentInnings?.bowling_team_id ? match.team_a : match.team_b;
  const battingPlayers = currentInnings?.batting_team_id === match.team_a_id ? players.a : players.b;
  const bowlingPlayers = currentInnings?.bowling_team_id === match.team_a_id ? players.a : players.b;

  const inningsBalls = balls.filter((b) => b.innings_no === currentInnings?.innings_no);
  const legalBalls = inningsBalls.filter((b) => b.extra_type !== "wide" && b.extra_type !== "no_ball").length;
  const overNo = Math.floor(legalBalls / 6);
  const ballInOver = legalBalls % 6;
  const oversStr = `${overNo}.${ballInOver}`;
  const totalRuns = currentInnings?.runs ?? 0;
  const totalWickets = currentInnings?.wickets ?? 0;
  const totalBalls = legalBalls;
  const runRate = totalBalls > 0 ? ((totalRuns * 6) / totalBalls).toFixed(2) : "0.00";

  const thisOver = inningsBalls.slice(-Math.max(ballInOver === 0 && legalBalls > 0 ? 6 : (ballInOver + inningsBalls.filter(b => b.extra_type==='wide'||b.extra_type==='no_ball').length), 6));

  const recordBall = async (opts: { runs: number; extra?: "wide" | "no_ball" | "bye" | "leg_bye"; wicket?: boolean; dismissalType?: string }) => {
    if (!isOrganizer || !currentInnings) return;
    if (!striker || !bowler) { toast.error("Pick striker and bowler first."); return; }
    if (match.status === "scheduled") {
      await supabase.from("matches").update({ status: "live" }).eq("id", match.id);
    }
    const extra = opts.extra ?? "none";
    const isExtraRun = extra === "wide" || extra === "no_ball";
    const runs = opts.runs;
    const extra_runs = isExtraRun ? 1 : 0;

    const { error } = await supabase.from("balls").insert({
      match_id: id, innings_no: currentInnings.innings_no, over_no: overNo, ball_no: ballInOver + 1,
      batter_id: striker, non_striker_id: nonStriker || null, bowler_id: bowler,
      runs, extra_type: extra, extra_runs,
      is_wicket: !!opts.wicket, dismissal_type: opts.wicket ? (opts.dismissalType as any) || "bowled" : null,
      dismissed_player_id: opts.wicket ? striker : null,
    });
    if (error) return toast.error(error.message);

    // update innings totals
    const newRuns = currentInnings.runs + runs + extra_runs;
    const newWickets = currentInnings.wickets + (opts.wicket ? 1 : 0);
    const newExtras = currentInnings.extras + extra_runs + (extra === "bye" || extra === "leg_bye" ? runs : 0);
    const newBalls = currentInnings.balls + (isExtraRun ? 0 : 1);
    await supabase.from("innings").update({ runs: newRuns, wickets: newWickets, extras: newExtras, balls: newBalls }).eq("id", currentInnings.id);

    // strike rotation on odd runs (not for wides)
    if (!isExtraRun && runs % 2 === 1) {
      const tmp = striker; setStriker(nonStriker); setNonStriker(tmp);
    }
    // end of over rotation
    const nextLegal = newBalls;
    if (nextLegal > 0 && nextLegal % 6 === 0) {
      const tmp = striker; setStriker(nonStriker); setNonStriker(tmp);
      toast.success("Over complete — change bowler");
    }
  };

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/live/${id}`;
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "Live cricket", url: shareLink });
    else { await navigator.clipboard.writeText(shareLink); toast.success("Link copied"); }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <Link to="/matches" className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100"><ArrowLeft className="h-4 w-4" /> Back</Link>
          <div className="text-xs opacity-80 truncate">{match.tournaments?.name}</div>
          <button onClick={share} className="inline-flex items-center gap-1 text-sm hover:opacity-80"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </header>

      {/* Scoreboard */}
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="rounded-2xl bg-card border shadow-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground p-5">
            <div className="flex items-center justify-between text-xs font-medium opacity-90">
              <span>INNINGS {currentInnings?.innings_no ?? 1} • {match.overs} OVERS</span>
              {match.status === "live" && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> LIVE</span>}
              {match.status === "scheduled" && <span className="px-2 py-0.5 rounded-full bg-white/20">SCHEDULED</span>}
              {match.status === "completed" && <span className="px-2 py-0.5 rounded-full bg-white/20">COMPLETED</span>}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-xs opacity-70">BATTING</div>
                <div className="font-display text-xl font-bold">{battingTeam?.name ?? "—"}</div>
              </div>
              <div className={`text-right tabular ${flash ? "score-flash" : ""}`}>
                <div className="font-display text-5xl font-bold">{totalRuns}<span className="text-2xl opacity-70">/{totalWickets}</span></div>
                <div className="text-xs opacity-80 mt-1">{oversStr} ov • RR {runRate}</div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="text-xs text-muted-foreground">vs {bowlingTeam?.name}</div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">This over</div>
              <div className="flex gap-1.5 tabular flex-wrap">
                {thisOver.length === 0 && <div className="text-sm text-muted-foreground">No balls bowled yet.</div>}
                {thisOver.map((b, i) => {
                  const label = b.is_wicket ? "W" : b.extra_type === "wide" ? `${b.runs+1}wd` : b.extra_type === "no_ball" ? `${b.runs+1}nb` : b.runs === 0 ? "•" : String(b.runs);
                  const cls = b.is_wicket ? "bg-destructive text-destructive-foreground" : b.runs === 6 ? "bg-warning text-warning-foreground" : b.runs === 4 ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground";
                  return <div key={i} className={`grid min-w-9 h-9 px-2 place-items-center rounded-full text-sm font-bold ${cls}`}>{label}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scorer controls — organizer only */}
      {isOrganizer && match.status !== "completed" && (
        <div className="mx-auto max-w-3xl px-4 mt-6">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-4 w-4 text-destructive" />
              <h2 className="font-display font-semibold">Scorer panel</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground">Striker</label>
                <select value={striker} onChange={(e) => setStriker(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
                  <option value="">Select…</option>
                  {battingPlayers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Non-striker</label>
                <select value={nonStriker} onChange={(e) => setNonStriker(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
                  <option value="">Select…</option>
                  {battingPlayers.filter(p => p.id !== striker).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bowler</label>
                <select value={bowler} onChange={(e) => setBowler(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
                  <option value="">Select…</option>
                  {bowlingPlayers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button key={r} onClick={() => recordBall({ runs: r })} className={`rounded-lg py-4 font-display text-2xl font-bold transition active:scale-95 ${
                  r === 4 ? "bg-success text-success-foreground" :
                  r === 6 ? "bg-warning text-warning-foreground" :
                  "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>{r}</button>
              ))}
              <button onClick={() => recordBall({ runs: 0, wicket: true, dismissalType: "bowled" })} className="col-span-2 rounded-lg py-4 font-display text-xl font-bold bg-destructive text-destructive-foreground active:scale-95">WICKET</button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button onClick={() => recordBall({ runs: 0, extra: "wide" })} className="rounded-md py-3 text-sm font-semibold border hover:bg-muted">Wide</button>
              <button onClick={() => recordBall({ runs: 0, extra: "no_ball" })} className="rounded-md py-3 text-sm font-semibold border hover:bg-muted">No-ball</button>
              <button onClick={() => recordBall({ runs: 1, extra: "bye" })} className="rounded-md py-3 text-sm font-semibold border hover:bg-muted">Bye</button>
              <button onClick={() => recordBall({ runs: 1, extra: "leg_bye" })} className="rounded-md py-3 text-sm font-semibold border hover:bg-muted">Leg-bye</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { const t = striker; setStriker(nonStriker); setNonStriker(t); }} className="rounded-md py-2 text-sm border hover:bg-muted">Swap strike</button>
              <button onClick={async () => {
                if (!confirm("End this innings?")) return;
                await supabase.from("innings").update({ is_completed: true }).eq("id", currentInnings.id);
                if (currentInnings.innings_no === 1) {
                  await supabase.from("innings").insert({ match_id: id, innings_no: 2, batting_team_id: currentInnings.bowling_team_id, bowling_team_id: currentInnings.batting_team_id });
                  await supabase.from("matches").update({ current_innings: 2 }).eq("id", id);
                  setStriker(""); setNonStriker(""); setBowler("");
                } else {
                  await supabase.from("matches").update({ status: "completed" }).eq("id", id);
                }
              }} className="rounded-md py-2 text-sm border hover:bg-muted">End innings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
