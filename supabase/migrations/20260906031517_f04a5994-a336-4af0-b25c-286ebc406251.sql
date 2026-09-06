CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  photo_url text,
  specialty text NOT NULL,
  degrees text NOT NULL DEFAULT '',
  chamber_address text NOT NULL DEFAULT '',
  consultation_fee numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  available_slots text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctors public read" ON public.doctors FOR SELECT TO anon, authenticated USING (active);
CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.doctor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_name text NOT NULL DEFAULT 'Anonymous',
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.doctor_reviews TO anon, authenticated;
GRANT ALL ON public.doctor_reviews TO service_role;
ALTER TABLE public.doctor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.doctor_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews public insert" ON public.doctor_reviews FOR INSERT TO anon, authenticated WITH CHECK (rating BETWEEN 1 AND 5);

CREATE TABLE public.lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  partner text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lab_tests TO anon, authenticated;
GRANT ALL ON public.lab_tests TO service_role;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lab tests public read" ON public.lab_tests FOR SELECT TO anon, authenticated USING (active);
CREATE TRIGGER lab_tests_updated_at BEFORE UPDATE ON public.lab_tests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  discount_text text NOT NULL DEFAULT '',
  image_url text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_banners TO anon, authenticated;
GRANT ALL ON public.hero_banners TO service_role;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners public read" ON public.hero_banners FOR SELECT TO anon, authenticated USING (active);
CREATE TRIGGER hero_banners_updated_at BEFORE UPDATE ON public.hero_banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL UNIQUE,
  name text NOT NULL,
  name_en text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'nursing',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT TO anon, authenticated USING (active);
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.nurse_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'nurse',
  qualification text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pending',
  nurse_id uuid REFERENCES public.nurses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.nurse_applications TO anon, authenticated;
GRANT ALL ON public.nurse_applications TO service_role;
ALTER TABLE public.nurse_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications public insert" ON public.nurse_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE TRIGGER nurse_applications_updated_at BEFORE UPDATE ON public.nurse_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text NOT NULL UNIQUE,
  patient_name text NOT NULL DEFAULT '',
  patient_phone text NOT NULL DEFAULT '',
  nurse_id uuid REFERENCES public.nurses(id) ON DELETE SET NULL,
  nurse_name text NOT NULL DEFAULT '',
  nurse_role text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  last_message text NOT NULL DEFAULT '',
  last_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chat_threads TO anon, authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads read by tracking" ON public.chat_threads FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER chat_threads_updated_at BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'patient',
  sender_name text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  photo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);
GRANT SELECT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages public read" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS trx_id text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;

INSERT INTO public.app_settings (key, value) VALUES ('bkash_payment_link', '') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.services (service_key, name, name_en, description, price, category) VALUES
  ('injection', 'ইনজেকশন পুশ', 'Injection Push', 'ঘরে বসে নিরাপদে ইনজেকশন', 300, 'nursing'),
  ('dressing', 'ড্রেসিং ও সেলাই', 'Dressing & Stitching', 'ক্ষত পরিষ্কার ও ড্রেসিং', 500, 'nursing'),
  ('saline', 'স্যালাইন / আইভি', 'Saline / IV', 'NS, DNS, Cholera স্যালাইন', 600, 'nursing'),
  ('vitals', 'ভাইটাল চেক', 'Vitals Check', 'বিপি, সুগার, অক্সিজেন', 100, 'nursing'),
  ('nebulizer', 'নেবুলাইজার', 'Nebulizer', 'শ্বাসকষ্টে নেবুলাইজেশন', 400, 'nursing'),
  ('catheter', 'ক্যাথেটার', 'Catheter', 'ক্যাথেটার সংযোজন/পরিবর্তন', 700, 'nursing')
ON CONFLICT (service_key) DO NOTHING;

INSERT INTO public.doctors (name, name_en, specialty, degrees, chamber_address, consultation_fee, rating, rating_count, available_slots, photo_url) VALUES
  ('ডা. মেহেদী হাসান', 'Dr. Mehedi Hasan', 'medicine', 'MBBS, FCPS (Medicine)', 'পপুলার ডায়াগনস্টিক, ধানমন্ডি, ঢাকা', 800, 4.8, 126, 'সন্ধ্যা ৬টা - রাত ৯টা', NULL),
  ('ডা. নুসরাত জাহান', 'Dr. Nusrat Jahan', 'gynecology', 'MBBS, FCPS (Gynae)', 'ইবনে সিনা, মিরপুর, ঢাকা', 1000, 4.9, 210, 'বিকাল ৪টা - রাত ৮টা', NULL),
  ('ডা. আরিফুল ইসলাম', 'Dr. Ariful Islam', 'cardiology', 'MBBS, MD (Cardiology)', 'ল্যাবএইড, ধানমন্ডি, ঢাকা', 1200, 4.7, 98, 'সন্ধ্যা ৭টা - রাত ১০টা', NULL),
  ('ডা. সাবরিনা রহমান', 'Dr. Sabrina Rahman', 'pediatrics', 'MBBS, DCH', 'সেন্ট্রাল হাসপাতাল, গ্রীন রোড, ঢাকা', 700, 4.6, 143, 'সকাল ১০টা - দুপুর ২টা', NULL),
  ('ডা. তানভীর আহমেদ', 'Dr. Tanvir Ahmed', 'orthopedics', 'MBBS, MS (Ortho)', 'এভারকেয়ার, বসুন্ধরা, ঢাকা', 1100, 4.5, 76, 'সন্ধ্যা ৬টা - রাত ৯টা', NULL),
  ('ডা. ফারহানা কবির', 'Dr. Farhana Kabir', 'neurology', 'MBBS, FCPS (Neuro)', 'স্কয়ার হাসপাতাল, পান্থপথ, ঢাকা', 1300, 4.8, 64, 'বিকাল ৫টা - রাত ৮টা', NULL),
  ('ডা. রেজাউল করিম', 'Dr. Rezaul Karim', 'dermatology', 'MBBS, DDV', 'পপুলার ডায়াগনস্টিক, উত্তরা, ঢাকা', 900, 4.4, 52, 'সন্ধ্যা ৬টা - রাত ৯টা', NULL),
  ('ডা. শারমিন সুলতানা', 'Dr. Sharmin Sultana', 'ent', 'MBBS, FCPS (ENT)', 'ইবনে সিনা, ধানমন্ডি, ঢাকা', 850, 4.3, 41, 'বিকাল ৪টা - রাত ৭টা', NULL);

INSERT INTO public.lab_tests (name, name_en, price, partner, instructions) VALUES
  ('ফুল বডি চেকআপ', 'Full Body Checkup', 2500, 'Popular Diagnostic', '১০-১২ ঘণ্টা খালি পেটে থাকতে হবে'),
  ('ব্লাড সুগার (FBS)', 'Blood Sugar (FBS)', 150, 'Ibn Sina', 'সকালে খালি পেটে স্যাম্পল দিতে হবে'),
  ('সিবিসি', 'Complete Blood Count', 400, 'Popular Diagnostic', 'বিশেষ প্রস্তুতির প্রয়োজন নেই'),
  ('লিপিড প্রোফাইল', 'Lipid Profile', 900, 'LabAid', '১২ ঘণ্টা খালি পেটে থাকতে হবে'),
  ('থাইরয়েড (TSH)', 'Thyroid (TSH)', 800, 'Ibn Sina', 'বিশেষ প্রস্তুতির প্রয়োজন নেই'),
  ('ক্রিয়েটিনিন', 'Serum Creatinine', 350, 'LabAid', 'পর্যাপ্ত পানি পান করুন'),
  ('লিভার ফাংশন টেস্ট', 'Liver Function Test', 1200, 'Popular Diagnostic', '৮ ঘণ্টা খালি পেটে থাকা ভালো'),
  ('ভিটামিন ডি', 'Vitamin D', 1800, 'LabAid', 'বিশেষ প্রস্তুতির প্রয়োজন নেই');

INSERT INTO public.hero_banners (title, subtitle, discount_text, sort_order) VALUES
  ('ঘরে বসে নার্সিং সেবা', 'অভিজ্ঞ নার্স ৬০ মিনিটের মধ্যে আপনার বাসায়', '১০% ছাড় CARE10 কোডে', 1),
  ('ফুল বডি চেকআপ', 'ঘরে বসেই স্যাম্পল কালেকশন', '২০% ছাড় এই সপ্তাহে', 2),
  ('মেডিকেল ইকুইপমেন্ট ভাড়া', 'অক্সিজেন সিলিন্ডার, হাসপাতাল বেড', 'ভাড়া শুরু ৳৫০০ থেকে', 3);