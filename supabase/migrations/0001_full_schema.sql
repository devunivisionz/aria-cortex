
-- === Aria Cortex v2 Schema ===
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

-- Orgs & members
create table if not exists orgs (id uuid primary key default gen_random_uuid(), name text not null, website text, created_at timestamptz default now());
create table if not exists org_members (id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, user_id uuid not null, role text check (role in ('owner','admin','member')) default 'member', created_at timestamptz default now(), unique(org_id,user_id));

-- Companies & metrics
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text,
  website text, linkedin_url text,
  country text, hq_region text, hq_city text,
  employees int, founded_year int,
  ownership_type text, industry text, sub_industries text[],
  business_model text, description text,
  desc_emb vector(768),
  created_at timestamptz default now(), last_updated timestamptz default now()
);
create table if not exists company_metrics ( company_id uuid references companies(id) on delete cascade, fy_year int, revenue_eur numeric, ebitda_eur numeric, ebitda_margin numeric, employees int, growth_rate numeric, primary key(company_id,fy_year));
create table if not exists source_ids ( company_id uuid references companies(id) on delete cascade, source text, external_id text, primary key (company_id, source) );

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  full_name text, first_name text, last_name text, title text, seniority text, email text, phone text, linkedin_url text, country text, source text, created_at timestamptz default now()
);

-- Mandates
create table if not exists mandates ( id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, name text not null, status text default 'active', created_at timestamptz default now() );
create table if not exists mandate_filters ( mandate_id uuid primary key references mandates(id) on delete cascade, filters jsonb not null, updated_at timestamptz default now() );

-- Favorites & Requests
create table if not exists favorites ( id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, mandate_id uuid references mandates(id) on delete cascade, company_id uuid references companies(id) on delete cascade, added_by uuid, note text, created_at timestamptz default now(), unique(mandate_id, company_id) );
create table if not exists match_requests ( id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, mandate_id uuid references mandates(id) on delete cascade, company_id uuid references companies(id) on delete cascade, status text check (status in ('requested','in_progress','intro_scheduled','closed_won','closed_lost')) default 'requested', priority int default 3, requested_by uuid, created_at timestamptz default now(), updated_at timestamptz default now() );

-- Outreach & learning
create table if not exists outreach_events ( id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, company_id uuid references companies(id), contact_id uuid references contacts(id), platform text, campaign_id text, event_type text, event_payload jsonb, occurred_at timestamptz );
create table if not exists learning_signals ( id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id) on delete cascade, mandate_id uuid references mandates(id) on delete cascade, company_id uuid references companies(id) on delete cascade, signal text check (signal in ('favorite','request','reply','intro','won','ignored','bounce')), weight numeric default 1.0, created_at timestamptz default now() );
create table if not exists scoring_weights ( id uuid primary key default gen_random_uuid(), mandate_id uuid references mandates(id) on delete cascade, w_sector numeric default 0.35, w_size numeric default 0.20, w_geo numeric default 0.20, w_owner numeric default 0.15, w_keywords numeric default 0.10, updated_at timestamptz default now() );

-- Usage metering
create table if not exists usage_counters ( org_id uuid, period date, metric text, value int default 0, primary key (org_id, period, metric) );

-- Privacy
create table if not exists contact_suppressions ( contact_id uuid references contacts(id) on delete cascade, reason text, created_at timestamptz default now(), primary key(contact_id) );

-- Weekly drops
create table if not exists weekly_drops ( id uuid primary key default gen_random_uuid(), investor_org_id uuid references orgs(id) on delete cascade, label text, created_at timestamptz default now() );
create table if not exists weekly_drop_items ( drop_id uuid references weekly_drops(id) on delete cascade, company_id uuid references companies(id) on delete cascade, rank int, fit_score numeric, rationale text, primary key(drop_id, company_id) );

-- Materialized view for latest metrics
create materialized view if not exists company_metrics_latest as
select distinct on (company_id) company_id, revenue_eur, ebitda_eur, fy_year
from company_metrics
order by company_id, fy_year desc;
create unique index if not exists idx_cml_company on company_metrics_latest(company_id);

-- Indexes
create index if not exists idx_companies_name_trgm on companies using gin (legal_name gin_trgm_ops);
create index if not exists idx_companies_industry on companies (industry);
create index if not exists idx_companies_country on companies (country);
create index if not exists idx_companies_subinds on companies using gin (sub_industries);

-- RLS (enable after JWT provides org_id)
-- alter table ... enable row level security;

-- Reporting views (examples)
create or replace view kpi_activation as
  select m.id as mandate_id, coalesce((select count(*) from favorites f where f.mandate_id=m.id and f.created_at <= m.created_at + interval '24 hours'),0) > 0 as activated
  from mandates m;

