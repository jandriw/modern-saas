create extension if not exists "uuid-ossp";

create table public.dates(
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references public.goals(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.dates enable row level security;

create policy "Users can view own dates" on dates
  for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can update own dates" on dates
  for update to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete own dates" on dates
  for delete to authenticated
    using (auth.uid() = user_id);