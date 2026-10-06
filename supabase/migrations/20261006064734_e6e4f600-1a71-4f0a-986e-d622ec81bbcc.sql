CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option_a text NOT NULL DEFAULT '', option_b text NOT NULL DEFAULT '',
  option_c text NOT NULL DEFAULT '', option_d text NOT NULL DEFAULT '',
  correct text NOT NULL DEFAULT 'a',
  reward integer NOT NULL DEFAULT 10,
  penalty integer NOT NULL DEFAULT 2,
  category text NOT NULL DEFAULT 'BCS Health',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_questions TO anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz public read" ON public.quiz_questions FOR SELECT TO anon, authenticated USING (active);
CREATE TRIGGER quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.nurse_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.nurse_notices TO service_role;
ALTER TABLE public.nurse_notices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cash_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  tracking_id text NOT NULL DEFAULT '',
  nurse_id uuid REFERENCES public.nurses(id) ON DELETE SET NULL,
  nurse_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cash_collections TO service_role;
ALTER TABLE public.cash_collections ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.nurses ADD COLUMN IF NOT EXISTS email text, ADD COLUMN IF NOT EXISTS password_hash text;

INSERT INTO public.app_settings(key, value) VALUES ('cannula_fee','150'),('visit_charge','200') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.quiz_questions(question, option_a, option_b, option_c, option_d, correct, category) VALUES
('মানবদেহের সবচেয়ে বড় অঙ্গ কোনটি?','যকৃত','ত্বক','ফুসফুস','মস্তিষ্ক','b','Medical Admission'),
('ইনসুলিন কোথা থেকে নিঃসৃত হয়?','অগ্ন্যাশয়','যকৃত','বৃক্ক','প্লীহা','a','Medical Admission'),
('স্বাভাবিক রক্তচাপ কত?','140/90','100/60','120/80','160/100','c','BCS Health'),
('রাতকানা রোগ কোন ভিটামিনের অভাবে হয়?','ভিটামিন C','ভিটামিন D','ভিটামিন K','ভিটামিন A','d','BCS Health'),
('রক্তের কোন কণিকা রোগ প্রতিরোধ করে?','লোহিত কণিকা','শ্বেত কণিকা','অণুচক্রিকা','প্লাজমা','b','Medical Admission'),
('ORS-এ কোন উপাদান থাকে না?','গ্লুকোজ','সোডিয়াম ক্লোরাইড','পটাশিয়াম ক্লোরাইড','ক্যালসিয়াম','d','BCS Health');