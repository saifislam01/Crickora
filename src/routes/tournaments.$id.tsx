import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, ArrowLeft, Users, Radio } from "lucide-react";

export const Route = createFileRoute("/tournaments/$id")({ component: TournamentDetail });

function TournamentDetail() {
  const { id } = Route.useParams();
  const [t, setT] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");

  const load = async () => {
    const { data: tr } = await supabase.from("tournaments").select("*").eq("id", id).maybeSingle();
    setT(tr);
    const { data: tm } = await supabase.from("teams").select("*, players(count)").eq("tournament_id", id).order("created_at");
    setTeams(tm ?? []);
    const { data: m } = await supabase.from("matches").select("*, team_a:teams!matches_team_a_id_fkey(name, short_name), team_b:teams!matches_team_b_id_fkey(name, short_name)").eq("tournament_id", id).order("scheduled_at", { ascending: true });
    setMatches(m ?? []);
  };
  useEffect(() => { load(); }, [id]);

  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("teams").insert({ tournament_id: id, name, short_name: shortName || name.slice(0, 3).toUpperCase() });
    if (error) return toast.error(error.message);
    toast.success("Team added");
    setOpen(false); setName(""); setShortName("");
    load();
  };

  if (!t) return <AppShell><div>Loading…</div></AppShell>;

  return (
    <AppShell>
      <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> All tournaments
      </Link>

      <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium opacity-80 uppercase tracking-wider">{t.format.replace("_", " ")} • {t.overs_per_innings} overs</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{t.name}</h1>
            {t.description && <p className="mt-2 opacity-80 max-w-2xl">{t.description}</p>}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
            t.status === "live" ? "bg-destructive text-destructive-foreground" :
            t.status === "completed" ? "bg-white/20" :
            "bg-success text-success-foreground"
          }`}>{t.status}</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-6 max-w-md">
          <div><div className="font-display text-2xl font-bold tabular">{teams.length}</div><div className="text-xs opacity-70">Teams</div></div>
          <div><div className="font-display text-2xl font-bold tabular">{matches.length}</div><div className="text-xs opacity-70">Matches</div></div>
          <div><div className="font-display text-2xl font-bold tabular">{matches.filter(m => m.status === "completed").length}</div><div className="text-xs opacity-70">Completed</div></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Teams</h2>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><Plus className="h-4 w-4" /> Add team</button>
          </div>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No teams yet. Add the first one to get started.</p>
          ) : (
            <ul className="space-y-1">
              {teams.map((tm) => (
                <li key={tm.id}>
                  <Link to="/teams/$id" params={{ id: tm.id }} className="flex items-center justify-between p-3 rounded-md hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground text-xs font-bold">{tm.short_name || tm.name.slice(0, 3).toUpperCase()}</div>
                      <div>
                        <div className="font-medium">{tm.name}</div>
                        <div className="text-xs text-muted-foreground">{tm.players?.[0]?.count ?? 0} players</div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Radio className="h-4 w-4" /> Matches</h2>
            <Link to="/matches/new" search={{ tournament: id }} className="inline-flex items-center gap-1 text-sm text-accent hover:underline"><Plus className="h-4 w-4" /> Schedule match</Link>
          </div>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No matches yet. Add at least 2 teams first.</p>
          ) : (
            <ul className="space-y-2">
              {matches.map((m) => (
                <li key={m.id}>
                  <Link to="/matches/$id" params={{ id: m.id }} className="flex items-center justify-between p-3 rounded-md hover:bg-muted">
                    <div className="text-sm">
                      <div className="font-medium">{m.team_a?.name} <span className="text-muted-foreground">vs</span> {m.team_b?.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{m.status}</div>
                    </div>
                    {m.status === "live" && <span className="inline-flex items-center gap-1 text-xs text-destructive"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> LIVE</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={addTeam} className="w-full max-w-sm rounded-xl bg-card border p-6 space-y-4">
            <h2 className="font-display text-xl font-bold">Add team</h2>
            <div>
              <label className="text-sm font-medium">Team name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" placeholder="Mumbai Royals" />
            </div>
            <div>
              <label className="text-sm font-medium">Short name (optional)</label>
              <input maxLength={4} value={shortName} onChange={(e) => setShortName(e.target.value.toUpperCase())} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm uppercase" placeholder="MUM" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">Add</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
