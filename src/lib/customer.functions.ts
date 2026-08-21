import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CatalogRow } from "@/lib/booking-types";

export const listStore = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("catalog_items")
    .select("*")
    .eq("active", true)
    .eq("kind", "product")
    .order("name");
  return { items: (data ?? []) as unknown as CatalogRow[] };
});

export const validatePromo = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; subtotal: number }) =>
    z.object({ code: z.string().trim().min(2).max(40), subtotal: z.number().min(0).max(1000000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = data.code.toUpperCase();
    const { data: promo } = await supabaseAdmin.from("promo_codes").select("*").eq("code", code).maybeSingle();
    if (!promo || !promo.active) return { ok: false as const, message: "কোডটি সঠিক নয়" };
    if (promo.expiry_date && new Date(promo.expiry_date) < new Date(new Date().toDateString()))
      return { ok: false as const, message: "কোডের মেয়াদ শেষ" };
    if (promo.usage_limit !== null && (promo.used_count ?? 0) >= promo.usage_limit)
      return { ok: false as const, message: "কোডের ব্যবহারসীমা শেষ" };
    const value = Number(promo.value);
    const discount =
      promo.discount_type === "percent"
        ? Math.round((data.subtotal * value) / 100)
        : Math.min(value, data.subtotal);
    return {
      ok: true as const,
      code,
      discount,
      label: promo.discount_type === "percent" ? `${value}% ছাড়` : `৳${value} ছাড়`,
    };
  });

export const submitRating = createServerFn({ method: "POST" })
  .inputValidator((data: { trackingId: string; rating: number; review?: string }) =>
    z
      .object({
        trackingId: z.string().trim().min(3).max(30),
        rating: z.number().int().min(1).max(5),
        review: z.string().trim().max(600).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = data.trackingId.replace(/^#/, "").toUpperCase();
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, nurse_id, status")
      .eq("tracking_id", id)
      .maybeSingle();
    if (!booking) throw new Error("Booking not found");
    await supabaseAdmin
      .from("bookings")
      .update({ rating: data.rating, review: data.review ?? null })
      .eq("id", booking.id);
    if (booking.nurse_id) {
      const { data: rated } = await supabaseAdmin
        .from("bookings")
        .select("rating")
        .eq("nurse_id", booking.nurse_id)
        .not("rating", "is", null);
      const scores = (rated ?? []).map((r) => Number(r.rating)).filter((n) => n > 0);
      if (scores.length) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        await supabaseAdmin
          .from("nurses")
          .update({ rating: Math.round(avg * 10) / 10 })
          .eq("id", booking.nurse_id);
      }
    }
    return { ok: true };
  });

const cartSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(4).max(240),
  payment_method: z.enum(["Cash", "bKash"]),
  promo_code: z.string().trim().max(40).optional(),
  items: z
    .array(z.object({ id: z.string().uuid(), qty: z.number().int().min(1).max(99) }))
    .min(1)
    .max(40),
});

export const placeStoreOrder = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof cartSchema>) => cartSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { makeTrackingId } = await import("@/lib/admin-auth.server");
    const { netPrice } = await import("@/lib/booking-types");
    const ids = data.items.map((i) => i.id);
    const { data: rows } = await supabaseAdmin.from("catalog_items").select("*").in("id", ids);
    const map = new Map((rows ?? []).map((r) => [r.id, r]));
    let subtotal = 0;
    const details: Record<string, string | number> = {};
    for (const it of data.items) {
      const row = map.get(it.id);
      if (!row) continue;
      const unit = netPrice(Number(row.price), Number(row.discount_pct));
      subtotal += unit * it.qty;
      details[row.name] = `${it.qty} × ৳${unit}`;
    }
    let discount = 0;
    if (data.promo_code) {
      const { data: promo } = await supabaseAdmin
        .from("promo_codes")
        .select("*")
        .eq("code", data.promo_code.toUpperCase())
        .maybeSingle();
      if (promo && promo.active) {
        discount =
          promo.discount_type === "percent"
            ? Math.round((subtotal * Number(promo.value)) / 100)
            : Math.min(Number(promo.value), subtotal);
        await supabaseAdmin
          .from("promo_codes")
          .update({ used_count: (promo.used_count ?? 0) + 1 })
          .eq("id", promo.id);
      }
    }
    const total = Math.max(0, subtotal - discount);
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        tracking_id: makeTrackingId(),
        service: "সার্জিক্যাল স্টোর অর্ডার (Store Order)",
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address,
        details,
        amount: subtotal,
        discount,
        total,
        promo_code: data.promo_code?.toUpperCase() || null,
        payment_method: data.payment_method,
        price_estimate: `৳${total}`,
        tier: "worker",
      })
      .select("tracking_id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("leads")
      .upsert(
        { phone: data.phone, name: data.customer_name, source: "store", last_service: "Store Order" },
        { onConflict: "phone" },
      );
    return { trackingId: row.tracking_id as string, subtotal, discount, total };
  });

/** Live nebulizer machine availability for the rental option. */
export const nebulizerAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { NEB_MACHINE_STOCK } = await import("@/lib/site");
  const { count } = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .ilike("service", "%নেবুলাইজার%")
    .neq("status", "Completed")
    .gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString());
  const busy = Math.min(NEB_MACHINE_STOCK, count ?? 0);
  return { total: NEB_MACHINE_STOCK, available: Math.max(0, NEB_MACHINE_STOCK - busy) };
});
