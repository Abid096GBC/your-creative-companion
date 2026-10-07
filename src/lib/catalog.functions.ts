import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const pw = z.string().min(1).max(200);

async function admin(password: string) {
  const { checkPassword } = await import("@/lib/admin-auth.server");
  checkPassword(password);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const TABLES = ["doctors", "lab_tests", "hero_banners", "services", "quiz_questions", "nurse_notices"] as const;
export type CatalogTable = (typeof TABLES)[number];

/* ---------- Admin: catalogue CRUD ---------- */

export const adminListCatalog = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; table: CatalogTable }) =>
    z.object({ password: pw, table: z.enum(TABLES) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const q = db.from(data.table).select("*");
    const { data: rows, error } = await (data.table === "hero_banners"
      ? q.order("sort_order", { ascending: true }).order("created_at", { ascending: true })
      : q.order("created_at", { ascending: data.table !== "nurse_notices" }));
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as Record<string, string | number | boolean | null>[];
  });

export const adminSaveCatalog = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; table: CatalogTable; id?: string; row: Record<string, unknown> }) =>
    z
      .object({
        password: pw,
        table: z.enum(TABLES),
        id: z.string().uuid().optional(),
        row: z.record(z.string(), z.union([z.string().max(3_000_000), z.number(), z.boolean(), z.null()])),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const row = { ...data.row };
    delete row["id"];
    delete row["created_at"];
    delete row["updated_at"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = db.from(data.table) as any;
    const { error } = data.id ? await t.update(row).eq("id", data.id) : await t.insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCatalog = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; table: CatalogTable; id: string }) =>
    z.object({ password: pw, table: z.enum(TABLES), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { error } = await db.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Settings (bKash link) ---------- */

export const adminSaveSetting = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; key: string; value: string }) =>
    z.object({ password: pw, key: z.string().max(60), value: z.string().max(1000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { error } = await db.from("app_settings").upsert({ key: data.key, value: data.value });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Nurse applications ---------- */

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d: Record<string, string>) =>
    z
      .object({
        name: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(6).max(20),
        email: z.string().trim().max(120).default(""),
        tier: z.string().trim().max(40).default("nurse"),
        qualification: z.string().trim().max(200).default(""),
        experience: z.string().trim().max(100).default(""),
        area: z.string().trim().max(120).default(""),
        note: z.string().trim().max(1000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("nurse_applications").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListApplications = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => z.object({ password: pw }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { data: rows } = await db.from("nurse_applications").select("*").order("created_at", { ascending: false });
    return rows ?? [];
  });

export const adminApproveApplication = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string; nurseCode: string; pin: string; email?: string }) =>
    z
      .object({
        password: pw,
        id: z.string().uuid(),
        nurseCode: z.string().trim().min(2).max(20).regex(/^[A-Za-z0-9-]+$/),
        pin: z.string().trim().min(4).max(64),
        email: z.string().trim().email().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { hashPassword } = await import("@/lib/admin-auth.server");
    if (data.email) {
      const { data: dup } = await db.from("nurses").select("id").eq("email", data.email.toLowerCase()).maybeSingle();
      if (dup) throw new Error("এই ইমেইল আগে থেকেই ব্যবহৃত");
    }
    const { data: app } = await db.from("nurse_applications").select("*").eq("id", data.id).maybeSingle();
    if (!app) throw new Error("Application not found");
    const { data: nurse, error } = await db
      .from("nurses")
      .insert({
        name: app.name,
        phone: app.phone,
        area: app.area || null,
        tier: app.tier === "caregiver" ? "caregiver" : "nurse",
        nurse_code: data.nurseCode.toUpperCase(),
        login_pin: data.pin,
        email: data.email ? data.email.toLowerCase() : null,
        password_hash: await hashPassword(data.pin),
        active: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message.includes("duplicate") ? "এই Nurse ID আগে থেকেই আছে" : error.message);
    await db.from("nurse_applications").update({ status: "Approved", nurse_id: nurse.id }).eq("id", data.id);
    return { ok: true };
  });

export const adminRejectApplication = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => z.object({ password: pw, id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    await db.from("nurse_applications").update({ status: "Rejected" }).eq("id", data.id);
    return { ok: true };
  });

/* ---------- Monitored chat ---------- */

const msgShape = {
  text: z.string().trim().max(2000).default(""),
  photo: z.string().max(3_000_000).optional(),
};

async function postMessage(
  db: Awaited<ReturnType<typeof admin>>,
  threadId: string,
  sender: string,
  senderName: string,
  text: string,
  photo?: string,
) {
  if (!text && !photo) throw new Error("Empty message");
  const { error } = await db
    .from("chat_messages")
    .insert({ thread_id: threadId, sender, sender_name: senderName, text, photo: photo ?? null });
  if (error) throw new Error(error.message);
  await db
    .from("chat_threads")
    .update({ last_message: text || "📷 ছবি", last_at: new Date().toISOString() })
    .eq("id", threadId);
}

/** Opens (or creates) the chat thread for a booking tracking ID. */
export const openChatThread = createServerFn({ method: "POST" })
  .inputValidator((d: { trackingId: string }) =>
    z.object({ trackingId: z.string().trim().min(3).max(40) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const tid = data.trackingId.toUpperCase();
    const { data: existing } = await db.from("chat_threads").select("*").eq("tracking_id", tid).maybeSingle();
    if (existing) return existing;
    const { data: booking } = await db.from("bookings").select("*").eq("tracking_id", tid).maybeSingle();
    let nurse: { id: string; name: string; tier: string } | null = null;
    if (booking?.nurse_id) {
      const { data: n } = await db.from("nurses").select("id,name,tier").eq("id", booking.nurse_id).maybeSingle();
      nurse = n;
    }
    const { data: created, error } = await db
      .from("chat_threads")
      .insert({
        tracking_id: tid,
        patient_name: booking?.customer_name ?? "",
        patient_phone: booking?.phone ?? "",
        nurse_id: nurse?.id ?? null,
        nurse_name: nurse?.name ?? "শুশ্রূষা কেয়ার টিম",
        nurse_role: nurse?.tier === "caregiver" ? "Caregiver" : "Nurse",
        service: booking?.service ?? "",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const patientSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { trackingId: string; name?: string; text?: string; photo?: string }) =>
    z.object({ trackingId: z.string().trim().min(3).max(40), name: z.string().max(80).optional(), ...msgShape }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: t } = await db
      .from("chat_threads")
      .select("id,patient_name")
      .eq("tracking_id", data.trackingId.toUpperCase())
      .maybeSingle();
    if (!t) throw new Error("Thread not found");
    await postMessage(db, t.id, "patient", data.name || t.patient_name || "রোগী", data.text, data.photo);
    return { ok: true };
  });

export const nurseSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string; pin: string; trackingId: string; text?: string; photo?: string }) =>
    z
      .object({
        code: z.string().trim().min(2).max(20),
        pin: z.string().trim().min(3).max(20),
        trackingId: z.string().trim().min(3).max(40),
        ...msgShape,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: nurse } = await db
      .from("nurses")
      .select("id,name,login_pin")
      .eq("nurse_code", data.code.toUpperCase().replace(/^#/, ""))
      .maybeSingle();
    if (!nurse || nurse.login_pin !== data.pin) throw new Error("Invalid worker credentials");
    const tid = data.trackingId.toUpperCase();
    const { data: booking } = await db.from("bookings").select("nurse_id").eq("tracking_id", tid).maybeSingle();
    if (!booking || booking.nurse_id !== nurse.id) throw new Error("Not assigned to this order");
    let { data: t } = await db.from("chat_threads").select("id").eq("tracking_id", tid).maybeSingle();
    if (!t) {
      const res = await db
        .from("chat_threads")
        .insert({ tracking_id: tid, nurse_id: nurse.id, nurse_name: nurse.name, nurse_role: "Nurse" })
        .select("id")
        .single();
      t = res.data;
    }
    if (!t) throw new Error("Thread unavailable");
    await postMessage(db, t.id, "nurse", nurse.name, data.text, data.photo);
    return { ok: true, threadId: t.id };
  });

export const adminListThreads = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => z.object({ password: pw }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { data: rows } = await db.from("chat_threads").select("*").order("last_at", { ascending: false }).limit(200);
    return rows ?? [];
  });

export const adminSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; threadId: string; text?: string }) =>
    z.object({ password: pw, threadId: z.string().uuid(), ...msgShape }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    await postMessage(db, data.threadId, "admin", "Shushrusha Support", data.text, data.photo);
    return { ok: true };
  });

/* ---------- bKash payment recording ---------- */

export const recordBkashPayment = createServerFn({ method: "POST" })
  .inputValidator((d: { trackingId: string; trxId: string }) =>
    z.object({ trackingId: z.string().trim().min(3).max(40), trxId: z.string().trim().min(6).max(30) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    await db
      .from("bookings")
      .update({ payment_status: "Paid", payment_method: "bKash PGW", trx_id: data.trxId, paid_at: new Date().toISOString() })
      .eq("tracking_id", data.trackingId.toUpperCase());
    return { ok: true };
  });

/* ---------- Cash collections (admin finance) ---------- */

export const adminListCash = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => z.object({ password: pw }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(data.password);
    const { data: rows, error } = await db
      .from("cash_collections")
      .select("id, tracking_id, nurse_name, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({ ...r, amount: Number(r.amount) }));
  });
