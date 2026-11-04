ALTER TABLE public.bookings ADD COLUMN category text NOT NULL DEFAULT 'nursing';

UPDATE public.bookings SET category = CASE
  WHEN service ILIKE '%store%' OR service ILIKE '%স্টোর%' THEN 'store'
  WHEN service ILIKE '%lab%' OR service ILIKE '%টেস্ট%' THEN 'lab'
  WHEN service ILIKE '%doctor%' OR service ILIKE '%ডাক্তার%' OR service ILIKE '%consultation%' OR service ILIKE '%অ্যাপয়েন্টমেন্ট%' THEN 'doctor'
  ELSE 'nursing'
END;

CREATE INDEX IF NOT EXISTS bookings_category_idx ON public.bookings(category);
GRANT UPDATE (category) ON public.bookings TO anon, authenticated, service_role;
COMMENT ON COLUMN public.bookings.category IS 'Order routing: nursing -> nurse dashboard queue, lab -> lab operations, doctor -> doctor appointments, store -> store orders.';