import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CatalogRow, LeadRow, PromoRow } from "@/lib/booking-types";

const pw = z.string().min(1).max(200);

export const adminListExtras = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => z.object({ password: pw }).parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [promos, leads] = await Promise.all([
      supabaseAdmin.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    return {
      promos: (promos.data ?? []) as unknown as PromoRow[],
      leads: (leads.data ?? []) as unknown as LeadRow[],
    };
  });

const promoSchema = z.object({
  password: pw,
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(40),
  discount_type: z.enum(["flat", "percent"]),
  value: z.number().min(0).max(100000),
  expiry_date: z.string().trim().max(20).optional(),
  usage_limit: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().default(true),
});

export const adminSavePromo = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof promoSchema>) => promoSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      code: data.code.toUpperCase(),
      discount_type: data.discount_type,
      value: data.value,
      expiry_date: data.expiry_date || null,
      usage_limit: data.usage_limit ?? null,
      active: data.active,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("promo_codes").update(row).eq("id", data.id)
      : await supabaseAdmin.from("promo_codes").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePromo = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) =>
    z.object({ password: pw, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const productSchema = z.object({
  password: pw,
  id: z.string().uuid().optional(),
  item_key: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(120),
  name_en: z.string().trim().max(120).default(""),
  description: z.string().trim().max(400).default(""),
  unit: z.string().trim().max(40).default("pc"),
  price: z.number().min(0).max(1000000),
  discount_pct: z.number().min(0).max(90).default(0),
  image_url: z.string().trim().max(3_000_000).optional(),
  active: z.boolean().default(true),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof productSchema>) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      item_key: data.item_key,
      kind: "product",
      name: data.name,
      name_en: data.name_en,
      description: data.description,
      unit: data.unit,
      price: data.price,
      discount_pct: data.discount_pct,
      image_url: data.image_url || null,
      active: data.active,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("catalog_items").update(row).eq("id", data.id)
      : await supabaseAdmin.from("catalog_items").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) =>
    z.object({ password: pw, id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("catalog_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => z.object({ password: pw }).parse(data))
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("catalog_items").select("*").order("name");
    return { items: (rows ?? []) as unknown as CatalogRow[] };
  });

/** MedGemma clinical mode — image or text based clinical reasoning. */
export const adminMedGemma = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; prompt?: string; imageData?: string }) =>
    z
      .object({
        password: pw,
        prompt: z.string().max(4000).optional(),
        imageData: z.string().max(8_000_000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { checkPassword } = await import("@/lib/admin-auth.server");
    checkPassword(data.password);
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI unavailable");
    const system =
      "You are MedGemma, a clinical assistant for Shushrusha home nursing (Bangladesh). Read prescriptions, lab reports and drug queries. Extract drug names, dosage, frequency, duration, and give a simple Bengali clinical summary plus nurse instructions and red flags. Never give a diagnosis in place of a doctor.";
    const content: unknown[] = [{ type: "text", text: data.prompt || "এই রিপোর্ট/প্রেসক্রিপশনটি বিশ্লেষণ করো।" }];
    if (data.imageData) content.push({ type: "image_url", image_url: { url: data.imageData } });
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { text: json.choices?.[0]?.message?.content ?? "" };
  });
