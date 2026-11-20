create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Power Banks',
  price numeric(10,2) not null default 0,
  description text not null default '',
  image_url text not null default '',
  badge text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read" on public.products for select to anon, authenticated using (true);
create policy "admin insert" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.products (name, category, price, description, image_url, badge, sort_order) values
('Volt 20K MagSafe', 'Power Banks', 39.00, '20,000mAh magnetic wireless power bank with 22.5W fast charge.', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80', 'Bestseller', 1),
('Pocket 10K Slim', 'Power Banks', 24.00, 'Credit-card thin 10,000mAh with USB-C PD in and out.', 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=900&q=80', null, 2),
('GaN 65W Dual', 'Chargers', 32.00, 'Compact GaN wall charger — laptop, tablet and phone at once.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=80', 'New', 3),
('Braided C-to-C 2m', 'Chargers', 12.00, '100W braided cable built to survive 30,000 bends.', 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=900&q=80', null, 4),
('Clear Armor Case', 'Phone Cases', 18.00, 'Crystal-clear, anti-yellow, MagSafe-ready drop protection.', 'https://images.unsplash.com/photo-1601593346740-925612772716?w=900&q=80', null, 5),
('Graphite Silicone Case', 'Phone Cases', 16.00, 'Soft-touch silicone with microfiber lining.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80', 'Limited', 6);