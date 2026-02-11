-- Interactions table to store click counts and messages per user
create table interactions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  yes_clicks integer default 0,
  no_clicks integer default 0,
  message text,
  created_at timestamp with time zone default now()
);

-- Global stats table for aggregate tracking
create table global_stats (
  id integer primary key default 1,
  total_yes integer default 0,
  total_no integer default 0
);

-- Initial global stats row
insert into global_stats (id, total_yes, total_no) values (1, 0, 0);

-- Enable Row Level Security
alter table interactions enable row level security;
alter table global_stats enable row level security;

-- Policies for interactions: Allow inserts and updates, but no public reads
create policy "Allow internal inserts" on interactions for insert with check (true);
create policy "Allow internal updates" on interactions for update using (true);

-- Policies for global_stats: Allow updates (for incrementing), but no public reads
create policy "Allow internal updates" on global_stats for update using (true);

-- Atomic increment function
create or replace function increment_global_stats(yes_inc int, no_inc int)
returns void as $$
begin
  update global_stats
  set total_yes = total_yes + yes_inc,
      total_no = total_no + no_inc
  where id = 1;
end;
$$ language plpgsql security definer;
