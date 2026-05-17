import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/teams/$id")({ component: TeamDetail });

function TeamDetail() {
  const { id } = Route.useParams();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "batter", jersey_number: "" });

  const load = async () => {
    const { data: t } = await supabase.from("teams").select("*, tournaments(name, id)").eq("id", id).maybeSingle();
    setTeam(t);
    const { data: p } = await supabase.from("players").select("*").eq("team_id", id).order("name");
    setPlayers(p ?? []);
  };
  useEffect(() => { load(); }, [id]);

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("players").insert({
      team_id: id, name: form.name, role: form.role as any,
      jersey_number: form.jersey_number ? +form.jersey_number : null,
    });
    if (error) return toast.error(error.message);
    setOpen(false); setForm({ name: "", role: "batter", jersey_number: "" });
    load();
  };

  if (!team) return <AppShell><div>Loading…</div></AppShell>;

  return (
    <AppShell>
      <Link to="/tournaments/$id" params={{ id: team.tournaments.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> {team.tournaments.name}
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">{team.short_name || team.name.slice(0, 3).toUpperCase()}</div>
          <div>
            <h1 className="font-display text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground text-sm">{players.length} players</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">
          <Plus className="h-4 w-4" /> Add player
        </button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {players.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No players yet. Add your squad.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-4">#</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 tabular font-medium">{p.jersey_number ?? "—"}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 capitalize text-muted-foreground">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={addPlayer} className="w-full max-w-sm rounded-xl bg-card border p-6 space-y-4">
            <h2 className="font-display text-xl font-bold">Add player</h2>
            <input required placeholder="Player name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
              <option value="batter">Batter</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicket-keeper</option>
            </select>
            <input type="number" min={0} max={999} placeholder="Jersey # (optional)" value={form.jersey_number} onChange={(e) => setForm({ ...form, jersey_number: e.target.value })} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
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
