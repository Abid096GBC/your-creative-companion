CREATE TABLE public.booking_dose_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  dose_number integer NOT NULL CHECK (dose_number >= 1),
  scheduled_date text NOT NULL DEFAULT '',
  time_slot text NOT NULL DEFAULT '',
  session_token text NOT NULL UNIQUE,
  session_access_key text NOT NULL,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('pending', 'locked', 'completed')),
  completed_at timestamp with time zone,
  completed_by uuid REFERENCES public.nurses(id),
  nurse_share numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (booking_id, dose_number)
);
GRANT ALL ON public.booking_dose_sessions TO service_role;
ALTER TABLE public.booking_dose_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX booking_dose_sessions_booking_id_idx ON public.booking_dose_sessions(booking_id, dose_number);