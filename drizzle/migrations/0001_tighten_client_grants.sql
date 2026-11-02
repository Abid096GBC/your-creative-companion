REVOKE ALL ON public.nurse_notices FROM anon, authenticated;
REVOKE ALL ON public.cash_collections FROM anon, authenticated;
REVOKE ALL ON public.nurses FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.quiz_questions FROM anon, authenticated;