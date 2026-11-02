GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.promo_codes TO service_role;

CREATE POLICY "server only bookings" ON public.bookings FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "server only leads" ON public.leads FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "server only promo codes" ON public.promo_codes FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

REVOKE ALL ON public.bookings FROM anon, authenticated;
REVOKE ALL ON public.leads FROM anon, authenticated;
REVOKE ALL ON public.promo_codes FROM anon, authenticated;