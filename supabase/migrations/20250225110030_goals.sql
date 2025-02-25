create extension if not exists "uuid-ossp";

create table public.goals(
  id uuid unique default uuid_generate_v4(),
  goal text,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  primary key (id)
);

alter table public.goals enable row level security;

create policy "Users can view own goals" on goals
  for select to authenticated
    using (auth.uid() = user_id);

create policy "Users can update own goals" on goals
  for update to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete own goals" on goals
  for delete to authenticated
    using (auth.uid() = user_id);