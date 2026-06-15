-- Fight Theory Database Schema
-- Run this in your Supabase SQL editor

-- Picks table
create table if not exists picks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  fight_date date not null,
  event_name text not null,
  fighter_a text not null,
  fighter_b text not null,
  pick text not null,
  odds text not null,
  units numeric(4,1) default 1.0,
  result text default 'PENDING' check (result in ('WIN', 'LOSS', 'PUSH', 'PENDING')),
  profit_loss numeric(8,2) default 0,
  analysis text,
  tier text default 'FREE' check (tier in ('FREE', 'VIP')),
  is_live boolean default false
);

-- Subscribers table
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  email text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  tier text default 'FREE' check (tier in ('FREE', 'VIP')),
  subscription_status text default 'inactive',
  subscription_end timestamptz
);

-- Enable Row Level Security
alter table picks enable row level security;
alter table subscribers enable row level security;

-- Picks: public can read live FREE picks, VIP picks only for VIP users
create policy "Public can read live free picks" on picks
  for select using (is_live = true and tier = 'FREE');

create policy "Service role can do everything on picks" on picks
  using (auth.role() = 'service_role');

-- Subscribers: users can see their own row
create policy "Users can view own subscriber record" on subscribers
  for select using (true);

create policy "Service role can do everything on subscribers" on subscribers
  using (auth.role() = 'service_role');

-- Stats view
create or replace view public_stats as
select
  count(*) filter (where result = 'WIN') as wins,
  count(*) filter (where result = 'LOSS') as losses,
  count(*) filter (where result = 'PUSH') as pushes,
  count(*) filter (where result != 'PENDING') as total_picks,
  coalesce(sum(profit_loss) filter (where result != 'PENDING'), 0) as profit_loss,
  case
    when count(*) filter (where result != 'PENDING' and result != 'PUSH') > 0
    then round(
      count(*) filter (where result = 'WIN')::numeric /
      count(*) filter (where result != 'PENDING' and result != 'PUSH') * 100, 1
    )
    else 0
  end as win_rate,
  case
    when sum(units) filter (where result != 'PENDING') > 0
    then round(
      sum(profit_loss) filter (where result != 'PENDING') /
      sum(units) filter (where result != 'PENDING') * 100, 1
    )
    else 0
  end as roi
from picks
where is_live = true;
