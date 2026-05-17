
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Roles
create type public.app_role as enum ('super_admin','organizer','manager','scorer','umpire');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;
create policy "roles readable" on public.user_roles for select using (true);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Auto-create profile + organizer role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'organizer');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tournaments
create type public.tournament_format as enum ('round_robin','knockout','league');
create type public.tournament_status as enum ('upcoming','live','completed');
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  format tournament_format not null default 'round_robin',
  status tournament_status not null default 'upcoming',
  organizer_id uuid not null references auth.users(id) on delete cascade,
  overs_per_innings int not null default 20,
  start_date date,
  created_at timestamptz not null default now()
);
alter table public.tournaments enable row level security;
create policy "tournaments public read" on public.tournaments for select using (true);
create policy "organizer creates" on public.tournaments for insert with check (auth.uid() = organizer_id);
create policy "organizer updates" on public.tournaments for update using (auth.uid() = organizer_id);
create policy "organizer deletes" on public.tournaments for delete using (auth.uid() = organizer_id);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  short_name text,
  captain_name text,
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;
create policy "teams public read" on public.teams for select using (true);
create policy "organizer manages teams" on public.teams for all
  using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()))
  with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()));

-- Players
create type public.player_role as enum ('batter','bowler','allrounder','wicketkeeper');
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  role player_role not null default 'batter',
  jersey_number int,
  created_at timestamptz not null default now()
);
alter table public.players enable row level security;
create policy "players public read" on public.players for select using (true);
create policy "organizer manages players" on public.players for all
  using (exists (
    select 1 from public.teams tm
    join public.tournaments t on t.id = tm.tournament_id
    where tm.id = team_id and t.organizer_id = auth.uid()))
  with check (exists (
    select 1 from public.teams tm
    join public.tournaments t on t.id = tm.tournament_id
    where tm.id = team_id and t.organizer_id = auth.uid()));

-- Matches
create type public.match_status as enum ('scheduled','live','completed','abandoned');
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_a_id uuid not null references public.teams(id),
  team_b_id uuid not null references public.teams(id),
  overs int not null default 20,
  status match_status not null default 'scheduled',
  toss_winner_id uuid references public.teams(id),
  batting_first_id uuid references public.teams(id),
  current_innings int not null default 1,
  winner_id uuid references public.teams(id),
  result_text text,
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.matches enable row level security;
create policy "matches public read" on public.matches for select using (true);
create policy "organizer manages matches" on public.matches for all
  using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()))
  with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid()));

-- Innings
create table public.innings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  innings_no int not null,
  batting_team_id uuid not null references public.teams(id),
  bowling_team_id uuid not null references public.teams(id),
  runs int not null default 0,
  wickets int not null default 0,
  balls int not null default 0,
  extras int not null default 0,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(match_id, innings_no)
);
alter table public.innings enable row level security;
create policy "innings public read" on public.innings for select using (true);
create policy "organizer manages innings" on public.innings for all
  using (exists (
    select 1 from public.matches m
    join public.tournaments t on t.id = m.tournament_id
    where m.id = match_id and t.organizer_id = auth.uid()))
  with check (exists (
    select 1 from public.matches m
    join public.tournaments t on t.id = m.tournament_id
    where m.id = match_id and t.organizer_id = auth.uid()));

-- Balls
create type public.extra_type as enum ('none','wide','no_ball','bye','leg_bye');
create type public.dismissal_type as enum ('bowled','caught','lbw','run_out','stumped','hit_wicket','retired_out');
create table public.balls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  innings_no int not null,
  over_no int not null,
  ball_no int not null,
  batter_id uuid references public.players(id),
  non_striker_id uuid references public.players(id),
  bowler_id uuid references public.players(id),
  runs int not null default 0,
  extra_type extra_type not null default 'none',
  extra_runs int not null default 0,
  is_wicket boolean not null default false,
  dismissal_type dismissal_type,
  dismissed_player_id uuid references public.players(id),
  commentary text,
  created_at timestamptz not null default now()
);
alter table public.balls enable row level security;
create policy "balls public read" on public.balls for select using (true);
create policy "organizer manages balls" on public.balls for all
  using (exists (
    select 1 from public.matches m
    join public.tournaments t on t.id = m.tournament_id
    where m.id = match_id and t.organizer_id = auth.uid()))
  with check (exists (
    select 1 from public.matches m
    join public.tournaments t on t.id = m.tournament_id
    where m.id = match_id and t.organizer_id = auth.uid()));

create index idx_balls_match on public.balls(match_id, innings_no, over_no, ball_no);
create index idx_teams_tournament on public.teams(tournament_id);
create index idx_players_team on public.players(team_id);
create index idx_matches_tournament on public.matches(tournament_id);

-- Realtime
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.innings;
alter publication supabase_realtime add table public.balls;
