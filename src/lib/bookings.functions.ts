import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { BookingRow, CatalogRow, NurseRow } from "@/lib/booking-types";
import { NURSE_STATUSES, PAYMENT_STATUSES, STATUSES } from "@/lib/booking-types";

const bookingSchema = z.object({
  service: z.string().trim().min(2).max(120),
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  address: z.string().trim().min(4).max(240),
  details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  body_region: z.string().trim().max(60).optional(),
  stitch_count: z.number().int().min(0).max(200).optional(),
  referral_code: z.string().trim().max(40).optional(),
  price_estimate: z.string().trim().max(80).optional(),
  amount: z.number().min(0).max(100000).optional(),
  notes: z.string().trim().max(600).optional(),
  time_slot: z.string().trim().max(60).optional(),
  payment_method: z.enum(["Cash", "bKash"]).optional(),
  promo_code: z.string().trim().max(40).optional(),
  discount: z.number().min(0).max(100000).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;

const pw = z.string().min(1).max(200);

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: BookingInput) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { makeTrackingId } = await import("@/lib/admin-auth.server");
    const { serviceTier } = await import("@/lib/booking-types");
    const amount = data.amount ?? null;
    const discount = data.discount ?? 0;
    const total = amount === null ? null : Math.max(0, amount - discount);
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        tracking_id: makeTrackingId(),
        service: data.service,
        customer_name: data.customer_name,
        phone: data.phone,
        address: data.address,
        details: data.details,
        body_region: data.body_region ?? null,
        stitch_count: data.stitch_count ?? null,
        referral_code: data.referral_code || null,
        price_estimate: data.price_estimate ?? null,
        amount,
        notes: data.notes ?? null,
        time_slot: data.time_slot ?? null,
        payment_method: data.payment_method ?? null,
        promo_code: data.promo_code || null,
        discount,
        total,
        tier: serviceTier(data.service),
      })
      .select("tracking_id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("leads")
      .upsert(
        {
          phone: data.phone,
          name: data.customer_name,
          source: "booking",
          last_service: data.service,
        },
        { onConflict: "phone" },
      );
    if (data.promo_code) {
      const { data: promo } = await supabaseAdmin
        .from("promo_codes")
        .select("id, used_count")
        .eq("code", data.promo_code.toUpperCase())
        .maybeSingle();
      if (promo) {
        await supabaseAdmin
          .from("promo_codes")
          .update({ used_count: (promo.used_count ?? 0) + 1 })
          .eq("id", promo.id);
      }
    }
    return { trackingId: row.tracking_id as string };
  });


export const trackBooking = createServerFn({ method: "POST" })
  .inputValidator((data: { trackingId: string }) =>
    z.object({ trackingId: z.string().trim().min(3).max(30) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = data.trackingId.replace(/^#/, "").toUpperCase();
    const { data: row } = await supabaseAdmin
      .from("bookings")
      .select("tracking_id, service, status, created_at, price_estimate, nurse_id, rating, review, total, payment_status")
      .eq("tracking_id", id)
      .maybeSingle();
    if (!row) return null;
    let nurse: { name: string; rating: number; nurse_code: string } | null = null;
    if (row.nurse_id) {
      const { data: n } = await supabaseAdmin
        .from("nurses")
        .select("name, rating, nurse_code")
        .eq("id", row.nurse_id)
        .maybeSingle();
      nurse = n ? { name: n.name, rating: Number(n.rating), nurse_code: n.nurse_code } : null;
    }
    return {
      trackingId: row.tracking_id as string,
      service: row.service as string,
      status: row.status as string,
      price: (row.price_estimate as string | null) ?? "",
      createdAt: row.created_at as string,
      rating: (row.rating as number | null) ?? null,
      review: (row.review as string | null) ?? null,
      total: (row.total as number | null) ?? null,
      paymentStatus: row.payment_status as string,
      nurse,
    };
  });

export const adminListBookings = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => z.object({ password: pw }).parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [bookings, nurses, catalog] = await Promise.all([
      supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false }).limit(300),
      supabaseAdmin.from("nurses").select("*").order("rating", { ascending: false }),
      supabaseAdmin.from("catalog_items").select("*").order("kind").order("name"),
    ]);
    if (bookings.error) throw new Error(bookings.error.message);
    return {
      bookings: (bookings.data ?? []) as unknown as BookingRow[],
      nurses: (nurses.data ?? []) as unknown as NurseRow[],
      catalog: (catalog.data ?? []) as unknown as CatalogRow[],
    };
  });

export const adminUpdateStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; status: string }) =>
    z.object({ password: pw, id: z.string().uuid(), status: z.enum(STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAssignNurse = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; nurseId: string }) =>
    z.object({ password: pw, id: z.string().uuid(), nurseId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { splitPayout } = await import("@/lib/site");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: nurse, error: nErr } = await supabaseAdmin
      .from("nurses")
      .select("*")
      .eq("id", data.nurseId)
      .single();
    if (nErr) throw new Error(nErr.message);
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("amount")
      .eq("id", data.id)
      .single();
    if (bErr) throw new Error(bErr.message);
    const amount = Number(booking.amount ?? 0);
    const split = splitPayout(amount, Number(nurse.rating));
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        nurse_id: data.nurseId,
        status: "Nurse Assigned",
        nurse_share: split.nurse,
        platform_share: split.platform,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, pct: split.pct, nurse: split.nurse, platform: split.platform };
  });

export const adminSetPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; payment: string; amount?: number }) =>
    z
      .object({
        password: pw,
        id: z.string().uuid(),
        payment: z.enum(PAYMENT_STATUSES),
        amount: z.number().min(0).max(100000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { splitPayout } = await import("@/lib/site");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("amount, nurse_id")
      .eq("id", data.id)
      .single();
    const amount = data.amount ?? Number(booking?.amount ?? 0);
    let rating = 4;
    if (booking?.nurse_id) {
      const { data: n } = await supabaseAdmin.from("nurses").select("rating").eq("id", booking.nurse_id).maybeSingle();
      rating = Number(n?.rating ?? 4);
    }
    const split = splitPayout(amount, rating);
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: data.payment,
        amount,
        nurse_share: split.nurse,
        platform_share: split.platform,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const nurseSchema = z.object({
  password: pw,
  id: z.string().uuid().optional(),
  nurse_code: z.string().trim().min(3).max(20),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  rating: z.number().min(1).max(5),
  completed_visits: z.number().int().min(0).max(100000),
  status: z.enum(NURSE_STATUSES),
  area: z.string().trim().max(80).optional(),
  specialties: z.array(z.string().trim().max(30)).max(12).default([]),
  tier: z.enum(["nurse", "worker"]).default("nurse"),
  login_pin: z.string().trim().min(4).max(8).default("1234"),
  active: z.boolean().default(true),
  photo_url: z.string().trim().max(3_000_000).optional(),
});

export const adminSaveNurse = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof nurseSchema>) => nurseSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      nurse_code: data.nurse_code,
      name: data.name,
      phone: data.phone,
      rating: data.rating,
      completed_visits: data.completed_visits,
      status: data.status,
      area: data.area ?? null,
      specialties: data.specialties,
      tier: data.tier,
      login_pin: data.login_pin,
      active: data.active,
      photo_url: data.photo_url || null,
    };
    const query = data.id
      ? supabaseAdmin.from("nurses").update(row).eq("id", data.id)
      : supabaseAdmin.from("nurses").insert(row);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdatePrice = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; price: number }) =>
    z.object({ password: pw, id: z.string().uuid(), price: z.number().min(0).max(1000000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("catalog_items").update({ price: data.price }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAiAssistant = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { password: string; mode: string; prompt?: string; imageData?: string; bookingId?: string }) =>
      z
        .object({
          password: pw,
          mode: z.enum(["ocr", "dispatch", "summary", "chat"]),
          prompt: z.string().max(4000).optional(),
          imageData: z.string().max(8_000_000).optional(),
          bookingId: z.string().uuid().optional(),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword, askGemini } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const system =
      "You are the operations assistant for Shushrusha, a home nursing service in Bangladesh. Answer concisely in Bengali unless asked otherwise.";

    if (data.mode === "ocr") {
      const key = process.env["LOVABLE_API_KEY"];
      if (!key || !data.imageData) throw new Error("Prescription image required");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "এই প্রেসক্রিপশনের ছবি পড়ে বাংলায় সহজ ভাষায় সারসংক্ষেপ দাও: ওষুধের নাম, ডোজ, কত দিন, এবং নার্সের করণীয়।",
                },
                { type: "image_url", image_url: { url: data.imageData } },
              ],
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`AI error ${res.status}`);
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return { text: json.choices?.[0]?.message?.content ?? "" };
    }

    if (data.mode === "dispatch") {
      if (!data.bookingId) throw new Error("Booking required");
      const { data: b } = await supabaseAdmin.from("bookings").select("*").eq("id", data.bookingId).single();
      let nurseInfo = "কোনো নার্স নির্ধারিত হয়নি";
      if (b?.nurse_id) {
        const { data: n } = await supabaseAdmin
          .from("nurses")
          .select("name, rating, nurse_code, phone")
          .eq("id", b.nurse_id)
          .maybeSingle();
        if (n) nurseInfo = `${n.name} (#${n.nurse_code}, রেটিং ${n.rating}, ফোন ${n.phone})`;
      }
      const text = await askGemini(
        system,
        `দুটি WhatsApp মেসেজ টেমপ্লেট তৈরি করো।\n(ক) নার্সের জন্য বিস্তারিত ডিসপ্যাচ শিট\n(খ) কাস্টমারের জন্য কনফার্মেশন (নার্সের নাম ও রেটিংসহ)\n\nবুকিং: #${b?.tracking_id}\nসার্ভিস: ${b?.service}\nরোগী: ${b?.customer_name}, ফোন ${b?.phone}\nঠিকানা: ${b?.address}\nডিটেইলস: ${JSON.stringify(b?.details ?? {})}\nমূল্য: ${b?.price_estimate ?? "—"}\nনার্স: ${nurseInfo}`,
      );
      return { text };
    }

    if (data.mode === "summary") {
      const { data: rows } = await supabaseAdmin
        .from("bookings")
        .select("service, status, payment_status, amount, created_at, price_estimate")
        .order("created_at", { ascending: false })
        .limit(80);
      const text = await askGemini(
        system,
        `আজকের ও সাম্প্রতিক বুকিং ডেটা থেকে সংক্ষিপ্ত অপারেশনাল রিক্যাপ দাও (মোট বুকিং, সার্ভিস ভাগ, আয়, পেন্ডিং কাজ):\n${JSON.stringify(rows ?? [])}`,
      );
      return { text };
    }

    const text = await askGemini(system, data.prompt ?? "সংক্ষেপে সাহায্য করো।");
    return { text };
  });
