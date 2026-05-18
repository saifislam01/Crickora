import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trophy } from "lucide-react";

export const Route = createFileRoute("/tournaments")({ component: TournamentsPage });

function TournamentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; format: "round_robin" | "knockout" | "league"; overs_per_innings: number; description: string }>({ name: "", format: "round_robin", overs_per_innings: 20, description: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("tournaments").select("*").eq("organizer_id", u.user.id).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("tournaments").insert({ ...form, organizer_id: u.user.id });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Tournament created");
    setOpen(false);
    setForm({ name: "", format: "round_robin", overs_per_innings: 20, description: "" });
    load();
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tournaments</h1>
          <p className="text-muted-foreground mt-1">Create and manage your leagues.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent">
          <Plus className="h-4 w-4" /> New tournament
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-display text-lg font-semibold">No tournaments yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Create your first tournament to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <Link key={t.id} to="/tournaments/$id" params={{ id: t.id }} className="rounded-xl border bg-card p-5 hover:shadow-md transition group">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Trophy className="h-5 w-5" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                  t.status === "live" ? "bg-destructive/10 text-destructive" :
                  t.status === "completed" ? "bg-muted text-muted-foreground" :
                  "bg-success/10 text-success"
                }`}>{t.status}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-accent">{t.name}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="capitalize">{t.format.replace("_", " ")}</span>
                <span>•</span>
                <span>{t.overs_per_innings} overs</span>
              </div>
              {t.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
            </Link>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={create} className="w-full max-w-md rounded-xl bg-card border p-6 space-y-4">
            <h2 className="font-display text-xl font-bold">New tournament</h2>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" placeholder="Champions League T20" />
            </div>
            <div>
              <label className="text-sm font-medium">Format</label>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
                <option value="round_robin">Round robin</option>
                <option value="knockout">Knockout</option>
                <option value="league">League</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Overs per innings</label>
              <input type="number" min={1} max={50} value={form.overs_per_innings} onChange={(e) => setForm({ ...form, overs_per_innings: +e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm" rows={3} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button disabled={busy} type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60">{busy ? "Creating…" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
