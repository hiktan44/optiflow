-- profiles
create table profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  email              text not null,
  full_name          text,
  avatar_url         text,
  plan               text not null default 'free',
  stripe_customer_id text unique,
  mtu_limit          integer not null default 2500,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- projects
create table projects (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references profiles(id) on delete cascade not null,
  name         text not null,
  domain       text not null,
  snippet_key  text not null unique default gen_random_uuid()::text,
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- experiments
create table experiments (
  id             uuid default gen_random_uuid() primary key,
  project_id     uuid references projects(id) on delete cascade not null,
  name           text not null,
  description    text,
  status         text not null default 'draft',
  target_url     text not null,
  traffic_split  integer not null default 50,
  targeting      jsonb not null default '{}',
  started_at     timestamptz,
  ended_at       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- variations
create table variations (
  id             uuid default gen_random_uuid() primary key,
  experiment_id  uuid references experiments(id) on delete cascade not null,
  name           text not null,
  index          integer not null default 0,
  changes        jsonb not null default '[]',
  created_at     timestamptz not null default now()
);

-- goals
create table goals (
  id             uuid default gen_random_uuid() primary key,
  experiment_id  uuid references experiments(id) on delete cascade not null,
  name           text not null,
  type           text not null,
  selector       text,
  url_pattern    text,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now()
);

-- events (partitioned)
create table events (
  id             uuid default gen_random_uuid() primary key,
  project_id     uuid references projects(id) on delete cascade not null,
  experiment_id  uuid references experiments(id),
  variation_id   uuid references variations(id),
  goal_id        uuid references goals(id),
  session_id     text not null,
  visitor_id     text not null,
  event_type     text not null,
  metadata       jsonb not null default '{}',
  created_at     timestamptz not null default now()
) partition by range (created_at);

create table events_2026_04 partition of events
  for values from ('2026-04-01') to ('2026-05-01');

create table events_2026_05 partition of events
  for values from ('2026-05-01') to ('2026-06-01');

create table events_2026_06 partition of events
  for values from ('2026-06-01') to ('2026-07-01');

-- subscriptions
create table subscriptions (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references profiles(id) on delete cascade not null unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  plan                    text not null,
  status                  text not null,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Indexes
create index idx_projects_user_id           on projects(user_id);
create index idx_projects_snippet_key       on projects(snippet_key);
create index idx_experiments_project_id     on experiments(project_id);
create index idx_experiments_status         on experiments(status);
create index idx_variations_experiment_id   on variations(experiment_id);
create index idx_goals_experiment_id        on goals(experiment_id);
create index idx_events_project_id          on events(project_id);
create index idx_events_experiment_id       on events(experiment_id);
create index idx_events_visitor_id          on events(visitor_id);
create index idx_events_created_at          on events(created_at);
create index idx_subscriptions_user_id      on subscriptions(user_id);

-- RLS
alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table projects enable row level security;
create policy "Users can manage own projects" on projects for all using (auth.uid() = user_id);

alter table experiments enable row level security;
create policy "Project owners manage experiments" on experiments
  for all using (
    project_id in (select id from projects where user_id = auth.uid())
  );

alter table variations enable row level security;
create policy "Experiment owners manage variations" on variations
  for all using (
    experiment_id in (
      select e.id from experiments e
      join projects p on e.project_id = p.id
      where p.user_id = auth.uid()
    )
  );

alter table goals enable row level security;
create policy "Experiment owners manage goals" on goals
  for all using (
    experiment_id in (
      select e.id from experiments e
      join projects p on e.project_id = p.id
      where p.user_id = auth.uid()
    )
  );

alter table events enable row level security;
create policy "Project owners read events" on events
  for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

alter table subscriptions enable row level security;
create policy "Users view own subscription" on subscriptions
  for select using (auth.uid() = user_id);
