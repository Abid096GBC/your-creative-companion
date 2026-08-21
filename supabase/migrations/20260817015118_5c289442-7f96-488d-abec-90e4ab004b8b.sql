
CREATE TABLE public.nurses (
  id uuid primary key default gen_random_uuid(),
  nurse_code text not null unique,
  name text not null,
  phone text not null,
  rating numeric(2,1) not null default 4.0,
  completed_visits integer not null default 0,
  status text not null default 'Available',
  specialties text[] not null default '{}',
  area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT ALL ON public.nurses TO service_role;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  item_key text not null unique,
  kind text not null default 'product',
  name text not null,
  name_en text not null default '',
  unit text not null default 'pc',
  price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.catalog_items TO anon;
GRANT SELECT ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog public read" ON public.catalog_items FOR SELECT TO anon, authenticated USING (active);

ALTER TABLE public.bookings
  ADD COLUMN nurse_id uuid REFERENCES public.nurses(id) ON DELETE SET NULL,
  ADD COLUMN payment_status text NOT NULL DEFAULT 'Unpaid',
  ADD COLUMN amount numeric(10,2),
  ADD COLUMN nurse_share numeric(10,2),
  ADD COLUMN platform_share numeric(10,2);

CREATE TRIGGER nurses_updated_at BEFORE UPDATE ON public.nurses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER catalog_updated_at BEFORE UPDATE ON public.catalog_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.nurses (nurse_code, name, phone, rating, completed_visits, status, specialties, area) VALUES
 ('NUR-101','রুমানা আক্তার','01711000101',4.8,214,'Available','{injection,saline,dressing}','ঢাকা - ধানমন্ডি'),
 ('NUR-102','সাদিয়া ইসলাম','01711000102',4.5,168,'Available','{suturing,dressing}','ঢাকা - মিরপুর'),
 ('NUR-103','মোঃ আরিফ হোসেন','01711000103',4.2,131,'On-Duty','{injection,nebulizer,vitals}','ঢাকা - উত্তরা'),
 ('NUR-104','নাজমুন নাহার','01711000104',5.0,320,'Available','{"post-surgery",caregiving,suturing}','নারায়ণগঞ্জ'),
 ('NUR-105','তানভীর রহমান','01711000105',3.9,74,'Off-Duty','{injection,vitals}','গাজীপুর');

INSERT INTO public.catalog_items (item_key, kind, name, name_en, unit, price) VALUES
 ('gauze','product','স্টেরাইল গজ','Sterile Gauze','pc',10),
 ('gauze-pack','product','স্টেরাইল গজ (প্যাক)','Sterile Gauze Pack','pack',35),
 ('bandage','product','ব্যান্ডেজ','Bandage','pc',10),
 ('roll-bandage-2','product','রোল ব্যান্ডেজ ২"','Roll Bandage 2"','pc',10),
 ('roll-bandage-4','product','রোল ব্যান্ডেজ ৪"','Roll Bandage 4"','pc',15),
 ('roll-bandage-6','product','রোল ব্যান্ডেজ ৬"','Roll Bandage 6"','pc',20),
 ('povisep-30','product','পভিসেপ ৩০ মি.লি.','Povisep 30ml','bottle',55),
 ('povisep-100','product','পভিসেপ ১০০ মি.লি.','Povisep 100ml','bottle',120),
 ('hexisol-50','product','হেক্সিসল ৫০ মি.লি.','Hexisol 50ml','bottle',55),
 ('hexisol-250','product','হেক্সিসল ২৫০ মি.লি.','Hexisol 250ml','bottle',130),
 ('gloves','product','সার্জিক্যাল গ্লাভস','Surgical Gloves','pair',20),
 ('mask','product','সার্জিক্যাল মাস্ক','Surgical Mask','pc',10),
 ('micropore','product','মাইক্রোপোর টেপ ১"','Micro-pore Tape 1"','roll',50),
 ('dressing-kit','product','ডিসপোজেবল ড্রেসিং কিট','Disposable Dressing Kit','kit',90),
 ('catgut','product','ক্যাটগাট / সুচার থ্রেড','Catgut / Suture Thread','pc',400),
 ('thermo-digital','product','ডিজিটাল থার্মোমিটার','Digital Thermometer','pc',200),
 ('thermo-analog','product','অ্যানালগ থার্মোমিটার','Analog Thermometer','pc',100),
 ('bp-monitor','product','ডিজিটাল বিপি মনিটর','Digital BP Monitor','unit',2200),
 ('gluco-strips','product','গ্লুকোমিটার স্ট্রিপ (৫০)','Glucometer Strips (50s)','box',800),
 ('neb-mask','product','নেবুলাইজার মাস্ক সেট','Nebulizer Mask Set','set',120),
 ('windel-plus','product','উইন্ডেল প্লাস নেবুলাইজার সলিউশন','Windel Plus (Incepta)','pack',150),
 ('budicort','product','বুডিকর্ট ০.২৫ নেবুলাইজার','Budicort 0.25 (Incepta)','ampoule',25),
 ('sultolin','product','সালটোলিন ২০ মি.লি.','Sultolin 20ml (Square)','bottle',121),
 ('iprex','product','আইপ্রেক্স ২০ মি.লি.','Iprex 20ml (Square)','bottle',131),
 ('svc-injection-adult','service','ইনজেকশন পুশ — বড়','Injection Adult (IV/IM)','visit',300),
 ('svc-injection-child','service','ইনজেকশন পুশ — বাচ্চা','Injection Child (IV/IM)','visit',500),
 ('svc-saline-only','service','স্যালাইন সেটআপ (ক্যানুলা আছে)','Saline Setup Only','visit',300),
 ('svc-cannula-only','service','ক্যানুলা ইনসার্শন','Cannula Insertion Only','visit',500),
 ('svc-cannula-saline','service','ক্যানুলা + স্যালাইন','Cannula + Saline','visit',600),
 ('svc-dressing','service','ড্রেসিং সেবা','Wound Dressing','visit',300),
 ('svc-stitch-removal','service','সেলাই কাটা (প্রতি সেলাই)','Stitch Removal per stitch','stitch',100),
 ('svc-suturing','service','নতুন সেলাই (প্রতি সেলাই)','New Suturing per stitch','stitch',300),
 ('svc-neb-nomed','service','নেবুলাইজেশন (ওষুধ ছাড়া)','Nebulizer w/o medicine','session',50),
 ('svc-neb-med','service','নেবুলাইজেশন (ওষুধসহ)','Nebulizer with medicine','session',100),
 ('svc-neb-rent','service','নেবুলাইজার মেশিন রেন্ট ৭ দিন','Nebulizer 7-day rental','rental',500),
 ('svc-vitals-1','service','ভাইটালস — ১টি','Vitals single','visit',150),
 ('svc-vitals-2','service','ভাইটালস — ২টি','Vitals any 2','visit',200),
 ('svc-vitals-3','service','ভাইটালস — ফুল কম্বো','Vitals full combo','visit',250),
 ('fee-night','surcharge','নাইট ভিজিট চার্জ (রাত ১০টার পর)','Night Visit Fee','visit',300),
 ('fee-conveyance','surcharge','কনভিনিয়েন্স চার্জ (সর্বনিম্ন)','Convenience Fee','visit',50);
