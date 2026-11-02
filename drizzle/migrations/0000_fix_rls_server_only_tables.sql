GRANT ALL ON public.nurse_notices TO service_role;
GRANT ALL ON public.cash_collections TO service_role;
GRANT ALL ON public.nurses TO service_role;
GRANT SELECT ON public.quiz_questions TO anon;

CREATE POLICY "server only notices" ON public.nurse_notices FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "server only collections" ON public.cash_collections FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "no direct client access to nurses" ON public.nurses FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);