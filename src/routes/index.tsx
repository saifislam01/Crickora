import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Radio, BarChart3, Smartphone, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CrickArena — Free cricket scoring & league management" },
      { name: "description", content: "Run tournaments, score matches ball-by-ball on mobile, and share public live scoreboards. Built for community and competitive cricket." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold">C</div>
            <span className="font-display text-lg font-bold">CrickArena</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#scoring" className="hover:text-foreground">Live scoring</a>
            <a href="#workflow" className="hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">Sign in</Link>
            <Link to="/login" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-accent transition">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-16 md:py-28 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
              </span>
              Free for every league. Forever.
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.02]">
              Cricket scoring,<br />
              <span className="text-accent">built like a pro league.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Create tournaments, manage teams, score matches ball-by-ball on mobile, and share a public live scoreboard with one tap.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-accent transition">
                Start a tournament
              </Link>
              <a href="#scoring" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition">
                See live scoring
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 max-w-md gap-6">
              {[
                { n: "T20 / ODI / Test", l: "Match formats" },
                { n: "0 ₹", l: "Core platform" },
                { n: "Realtime", l: "Score updates" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-xl md:text-2xl font-bold text-foreground tabular">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock scoreboard */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
              <div className="bg-primary text-primary-foreground p-5">
                <div className="flex items-center justify-between text-xs font-medium opacity-90">
                  <span>FINAL • CHAMPIONS LEAGUE T20</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-70">BATTING</div>
                      <div className="font-display font-bold text-lg">Mumbai Royals</div>
                    </div>
                    <div className="text-right tabular">
                      <div className="font-display text-3xl font-bold">186<span className="text-xl opacity-70">/4</span></div>
                      <div className="text-xs opacity-80">17.2 overs • RR 10.74</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm opacity-90">
                    <div>Chennai Kings</div>
                    <div className="tabular">142/10 (19.4)</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-xs text-muted-foreground">Striker</div>
                    <div className="font-semibold">R. Sharma*</div>
                    <div className="tabular text-xs text-muted-foreground">62 (38) • 4×8 6×2</div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-xs text-muted-foreground">Bowler</div>
                    <div className="font-semibold">D. Bravo</div>
                    <div className="tabular text-xs text-muted-foreground">3.2-0-31-1</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">This over</div>
                  <div className="flex gap-1.5 tabular">
                    {["1", "4", "•", "6", "W"].map((b, i) => (
                      <div key={i} className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                        b === "4" ? "bg-success text-success-foreground" :
                        b === "6" ? "bg-warning text-warning-foreground" :
                        b === "W" ? "bg-destructive text-destructive-foreground" :
                        "bg-secondary text-secondary-foreground"
                      }`}>{b}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-card/30">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-20">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Everything in one platform</div>
            <h2 className="mt-3 font-display text-4xl font-bold text-foreground">Run your league like a pro.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { i: Trophy, t: "Tournament management", d: "Round robin, knockout, or league. Auto-generate fixtures and points tables." },
              { i: Smartphone, t: "Mobile-first scoring", d: "One-handed ball-by-ball scoring engine. Optimized for speed on the field." },
              { i: Radio, t: "Public live scoreboards", d: "Shareable real-time match links for fans. Updates every ball." },
              { i: BarChart3, t: "Analytics & stats", d: "Player profiles, batting & bowling stats, leaderboards, and match history." },
              { i: ShieldCheck, t: "Role-based access", d: "Organizers, scorers, managers, umpires — each with the right permissions." },
              { i: Zap, t: "Realtime sync", d: "Every wicket, every boundary, instantly synced across viewers." },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border bg-card p-6 hover:shadow-md transition">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                  <f.i className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="workflow" className="border-t">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">Start scoring in 60 seconds.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Create your tournament, add teams, and go live. No setup fees, no per-match costs.</p>
          <Link to="/login" className="mt-8 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-accent transition">
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CrickArena. Built for cricket communities.
      </footer>
    </div>
  );
}
