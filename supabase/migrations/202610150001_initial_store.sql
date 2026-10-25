create extension if not exists pgcrypto with schema extensions;

create table if not exists public.menu_items (
  id text primary key,
  name text not null check (char_length(name) between 2 and 100),
  detail text not null check (char_length(detail) between 2 and 500),
  category text not null check (category in ('Rice', 'Swallow', 'Snacks', 'Drinks', 'Fast Food')),
  price integer not null check (price >= 0),
  tag text not null default 'MADE FRESH',
  available boolean not null default true,
  image text not null,
  alt text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ZEE-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 7 and 30),
  delivery_address text not null check (char_length(delivery_address) between 5 and 500),
  payment_method text not null check (payment_method in ('Bank transfer', 'Payment on delivery')),
  payment_status text not null check (payment_status in ('Awaiting verification', 'Due on delivery', 'Paid')),
  status text not null default 'Order received' check (status in ('Order received', 'Confirmed', 'Preparing', 'Out for delivery', 'Delivered')),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total = subtotal + delivery_fee),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  name text not null,
  quantity integer not null check (quantity between 1 and 50),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total = quantity * unit_price)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_order_number_phone_idx on public.orders (order_number, customer_phone);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'sultanabdulwaheed382@gmail.com', false);
$$;

alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view available menu" on public.menu_items;
create policy "Public can view available menu"
  on public.menu_items for select to anon, authenticated
  using (available or public.is_store_admin());

drop policy if exists "Store admin can manage menu" on public.menu_items;
create policy "Store admin can manage menu"
  on public.menu_items for all to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "Store admin can read orders" on public.orders;
create policy "Store admin can read orders"
  on public.orders for select to authenticated
  using (public.is_store_admin());

drop policy if exists "Store admin can update orders" on public.orders;
create policy "Store admin can update orders"
  on public.orders for update to authenticated
  using (public.is_store_admin())
  with check (public.is_store_admin());

drop policy if exists "Store admin can read order items" on public.order_items;
create policy "Store admin can read order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and public.is_store_admin()
    )
  );

grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

create or replace function public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_address text,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer;
  v_delivery_fee integer;
  v_payment_status text;
  v_item_count integer;
  v_result jsonb;
begin
  if char_length(trim(p_customer_name)) not between 2 and 100
    or char_length(trim(p_customer_phone)) not between 7 and 30
    or char_length(trim(p_delivery_address)) not between 5 and 500 then
    raise exception 'Please provide valid delivery details.' using errcode = '22023';
  end if;

  if p_payment_method not in ('Bank transfer', 'Payment on delivery') then
    raise exception 'Choose a supported payment method.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Your cart is invalid.' using errcode = '22023';
  end if;

  select count(*) into v_item_count from jsonb_array_elements(p_items);
  if v_item_count < 1 or v_item_count > 20 then
    raise exception 'Your cart must contain between 1 and 20 different items.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as requested(item)
    left join public.menu_items as menu on menu.id = requested.item ->> 'id'
    where menu.id is null
      or not menu.available
      or case
        when coalesce(requested.item ->> 'quantity', '') ~ '^[0-9]+$'
          then (requested.item ->> 'quantity')::integer not between 1 and 50
        else true
      end
  ) then
    raise exception 'A cart item is unavailable or has an invalid quantity.' using errcode = '22023';
  end if;

  if exists (
    select 1 from (
      select item ->> 'id' as item_id
      from jsonb_array_elements(p_items) as requested(item)
      group by item ->> 'id'
      having count(*) > 1
    ) duplicates
  ) then
    raise exception 'Your cart contains duplicate items.' using errcode = '22023';
  end if;

  select sum(menu.price * (requested.item ->> 'quantity')::integer)
  into v_subtotal
  from jsonb_array_elements(p_items) as requested(item)
  join public.menu_items as menu on menu.id = requested.item ->> 'id';

  -- Starter delivery policy; update these values after confirming the real business rules.
  v_delivery_fee := case when v_subtotal < 30000 then 1500 else 0 end;
  v_payment_status := case
    when p_payment_method = 'Bank transfer' then 'Awaiting verification'
    else 'Due on delivery'
  end;

  insert into public.orders (
    customer_name, customer_phone, delivery_address, payment_method,
    payment_status, subtotal, delivery_fee, total
  ) values (
    trim(p_customer_name), trim(p_customer_phone), trim(p_delivery_address), p_payment_method,
    v_payment_status, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee
  ) returning id, order_number into v_order_id, v_order_number;

  insert into public.order_items (order_id, menu_item_id, name, quantity, unit_price, line_total)
  select v_order_id, menu.id, menu.name, (requested.item ->> 'quantity')::integer,
    menu.price, menu.price * (requested.item ->> 'quantity')::integer
  from jsonb_array_elements(p_items) as requested(item)
  join public.menu_items as menu on menu.id = requested.item ->> 'id';

  select jsonb_build_object(
    'id', orders.order_number,
    'name', orders.customer_name,
    'phone', orders.customer_phone,
    'address', orders.delivery_address,
    'paymentMethod', orders.payment_method,
    'paymentStatus', orders.payment_status,
    'subtotal', orders.subtotal,
    'deliveryFee', orders.delivery_fee,
    'total', orders.total,
    'status', orders.status,
    'createdAt', orders.created_at,
    'items', coalesce(jsonb_agg(jsonb_build_object(
      'id', order_items.menu_item_id,
      'name', order_items.name,
      'quantity', order_items.quantity,
      'price', order_items.unit_price
    )), '[]'::jsonb)
  ) into v_result
  from public.orders
  join public.order_items on order_items.order_id = orders.id
  where orders.id = v_order_id
  group by orders.id;

  return v_result;
end;
$$;

create or replace function public.track_order(p_order_number text, p_customer_phone text)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id', orders.order_number,
    'name', orders.customer_name,
    'phone', orders.customer_phone,
    'address', orders.delivery_address,
    'status', orders.status,
    'paymentMethod', orders.payment_method,
    'paymentStatus', orders.payment_status,
    'total', orders.total,
    'createdAt', orders.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', order_items.menu_item_id,
        'name', order_items.name,
        'quantity', order_items.quantity,
        'price', order_items.unit_price
      )) from public.order_items where order_items.order_id = orders.id
    ), '[]'::jsonb)
  )
  from public.orders
  where orders.order_number = upper(trim(p_order_number))
    and regexp_replace(orders.customer_phone, '\D', '', 'g') = regexp_replace(p_customer_phone, '\D', '', 'g');
$$;

revoke all on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

insert into public.menu_items (id, name, detail, category, price, tag, available, image, alt) values
('party-jollof', 'Smoky Party Jollof', 'Smoky tomato-pepper rice, grilled chicken and sweet plantain', 'Rice', 8500, 'BESTSELLER', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian_jollof.jpg?width=900', 'Nigerian jollof rice'),
('small-chops', 'Small Chops Box', 'Puff-puff, samosas, spring rolls and spicy chicken kebab', 'Snacks', 12000, 'PARTY FAVE', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/SmallChops.jpg?width=900', 'Nigerian small chops with puff-puff, samosas and spring rolls'),
('asun', 'Barbecue Asun', 'Smoky, spicy grilled goat with onions and peppers', 'Fast Food', 15500, 'NICE & SPICY', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Goat_meat_Asun.jpg?width=900', 'Nigerian asun goat meat in pepper mix'),
('doughnut-bites', 'Zee Doughnut Bites', 'Soft, fluffy, sugar-dusted Nigerian-style doughnuts', 'Snacks', 5000, 'SWEET TREAT', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian-puff-puff-recipe_cropped.jpg?width=900', 'Nigerian puff-puff, a soft fried dough snack'),
('fried-rice', 'Naija Fried Rice', 'Colorful veg-packed fried rice with golden fried chicken', 'Rice', 8000, 'LUNCH FAVE', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/A_plate_of_rice_with_beef.jpg?width=900', 'Nigerian fried rice served with spiced beef'),
('ofada-rice', 'Ofada & Ayamase', 'Local ofada rice with rich, spicy green pepper sauce', 'Rice', 11000, 'LOCAL LOVE', false, 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigeria_ofada.jpg?width=900', 'Nigerian ofada rice and stew'),
('egusi-pounded-yam', 'Egusi & Pounded Yam', 'Melon-seed soup with assorted meat and smooth pounded yam', 'Swallow', 12500, 'SOUL FOOD', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/EGUSI_SOUP.JPG?width=900', 'Nigerian egusi soup'),
('efo-eba', 'Efo Riro & Eba', 'Spinach and pepper stew with assorted meat and soft eba', 'Swallow', 11500, 'HOME STYLE', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Efo_riro.jpg?width=900', 'Nigerian efo riro'),
('puff-puff', 'Fresh Puff-Puff', 'A warm dozen of soft, golden Nigerian puff-puff', 'Snacks', 3500, 'MADE FRESH', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Nigerian-puff-puff-recipe_cropped.jpg?width=900', 'Golden Nigerian puff-puff'),
('zobo', 'Chilled Zobo', 'Hibiscus drink brewed with ginger, pineapple and a little spice', 'Drinks', 2500, 'ICE COLD', true, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Zobo_drink.jpg/960px-Zobo_drink.jpg', 'A glass of chilled zobo drink made from roselle flowers'),
('yoghurt', 'Chilled Yoghurt', 'A smooth, creamy yoghurt drink served cold', 'Drinks', 2500, 'CHILLED', true, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Yogurt_drink.jpg/960px-Yogurt_drink.jpg', 'A chilled yoghurt drink served in a calabash'),
('chapman', 'Classic Chapman', 'Our fizzy Nigerian party classic with citrus and bitters', 'Drinks', 3000, 'PARTY CLASSIC', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Chapman_drink.jpg?width=900', 'Chapman, a Nigerian non-alcoholic cocktail'),
('suya-wrap', 'Chicken Suya Wrap', 'Suya-spiced grilled chicken, crunchy veg and yaji mayo', 'Fast Food', 7500, 'STREET FOOD', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Suya_with_pepper_sauce.jpg?width=900', 'Nigerian suya with pepper sauce and onions'),
('asun-fries', 'Asun Loaded Fries', 'Crispy fries topped with spicy asun, peppers and onions', 'Fast Food', 9500, 'NICE & SPICY', true, 'https://commons.wikimedia.org/wiki/Special:FilePath/Goat_meat_Asun.jpg?width=900', 'Nigerian asun goat meat in pepper mix')
on conflict (id) do nothing;
