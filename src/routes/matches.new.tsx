import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/matches/new")({
  component: NewMatch,
  validateSearch: (s: Record<string, unknown>) => ({ tournament: (s.tournament as string) || "" }),
});

function NewMatch() {
  const nav = useNavigate();
  const { tournament: presetT } = Route.useSearch();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [form, setForm] = useState({ tournament_id: presetT, team_a_id: "", team_b_id: "", overs: 20 });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("tournaments").select("*").eq("organizer_id", u.user.id);
      setTournaments(data ?? []);
      if (presetT) {
        const t = data?.find((x) => x.id === presetT);
        if (t) setForm((f) => ({ ...f, overs: t.overs_per_innings }));
      }
    })();
  }, [presetT]);

  useEffect(() => {
    if (!form.tournament_id) { setTeams([]); return; }
    supabase.from("teams").select("*").eq("tournament_id", form.tournament_id).then(({ data }) => setTeams(data ?? []));
  }, [form.tournament_id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.team_a_id === form.team_b_id) return toast.error("Pick two different teams.");
    const { data, error } = await supabase.from("matches").insert({
      tournament_id: form.tournament_id, team_a_id: form.team_a_id, team_b_id: form.team_b_id, overs: form.overs, batting_first_id: form.team_a_id,
    }).select().single();
    if (error) return toast.error(error.message);
    // create first innings
    await supabase.from("innings").insert({ match_id: data.id, innings_no: 1, batting_team_id: form.team_a_id, bowling_team_id: form.team_b_id });
    toast.success("Match created");
    nav({ to: "/matches/$id", params: { id: data.id } });
  };

  return (
    <AppShell>
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" /> Matches</Link>
      <h1 className="font-display text-3xl font-bold mb-8">New match</h1>
      <form onSubmit={submit} className="max-w-lg rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Tournament</label>
          <select required value={form.tournament_id} onChange={(e) => setForm({ ...form, tournament_id: e.target.value, team_a_id: "", team_b_id: "" })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
            <option value="">Select tournament…</option>
            {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Team A (bats first)</label>
            <select required value={form.team_a_id} onChange={(e) => setForm({ ...form, team_a_id: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Team B</label>
            <select required value={form.team_b_id} onChange={(e) => setForm({ ...form, team_b_id: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
              <option value="">Select…</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Overs</label>
          <input type="number" min={1} max={50} value={form.overs} onChange={(e) => setForm({ ...form, overs: +e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent">Create match</button>
      </form>
    </AppShell>
  );
}
