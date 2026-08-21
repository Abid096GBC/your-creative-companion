import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { BookingRow, NurseRow } from "@/lib/booking-types";

const cred = z.object({
  code: z.string().trim().min(2).max(20),
  pin: z.string().trim().min(3).max(20),
});

async function authWorker(code: string, pin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: worker } = await supabaseAdmin
    .from("nurses")
    .select("*")
    .eq("nurse_code", code.toUpperCase().replace(/^#/, ""))
    .maybeSingle();
  if (!worker || worker.login_pin !== pin) throw new Error("Invalid worker credentials");
  if (!worker.active) throw new Error("Account inactive");
  return { worker: worker as unknown as NurseRow, supabaseAdmin };
}

export const workerFeed = createServerFn({ method: "POST" })
  .inputValidator((data: z.input<typeof cred>) => cred.parse(data))
  .handler(async ({ data }) => {
    const { worker, supabaseAdmin } = await authWorker(data.code, data.pin);
    const { splitPayout } = await import("@/lib/site");
    const tiers = worker.tier === "nurse" ? ["nurse", "worker"] : ["worker"];
    const { data: open } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .is("nurse_id", null)
      .in("tier", tiers)
      .neq("status", "Completed")
      .order("created_at", { ascending: false })
      .limit(60);
    const { data: mine } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("nurse_id", worker.id)
      .order("created_at", { ascending: false })
      .limit(120);
    const myRows = (mine ?? []) as unknown as BookingRow[];
    const completed = myRows.filter((b) => b.status === "Completed");
    const earn = (rows: BookingRow[]) =>
      rows.reduce((sum, b) => sum + splitPayout(Number(b.total ?? b.amount ?? 0), Number(worker.rating)).nurse, 0);
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    return {
      worker: {
        id: worker.id,
        name: worker.name,
        nurse_code: worker.nurse_code,
        tier: worker.tier,
        rating: Number(worker.rating),
        completed_visits: worker.completed_visits,
        status: worker.status,
      },
      open: (open ?? []) as unknown as BookingRow[],
      mine: myRows,
      earnings: {
        today: earn(completed.filter((b) => b.created_at.slice(0, 10) === today)),
        week: earn(completed.filter((b) => b.created_at >= weekAgo)),
        total: earn(completed),
        pct: splitPayout(100, Number(worker.rating)).pct,
        jobs: completed.length,
      },
      reviews: myRows
        .filter((b) => b.rating)
        .slice(0, 12)
        .map((b) => ({ id: b.id, rating: b.rating ?? 0, review: b.review, service: b.service })),
    };
  });

export const workerAction = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { code: string; pin: string; bookingId: string; action: string; payment?: string; qr?: string }) =>
      z
        .object({
          code: cred.shape.code,
          pin: cred.shape.pin,
          bookingId: z.string().uuid(),
          action: z.enum(["accept", "transit", "active", "payment", "complete"]),
          payment: z.enum(["Paid via bKash", "Cash Collected by Nurse"]).optional(),
          qr: z.string().trim().max(120).optional(),
        })
        .parse(data),
  )
  .handler(async ({ data }) => {
    const { worker, supabaseAdmin } = await authWorker(data.code, data.pin);
    const { splitPayout } = await import("@/lib/site");
    const { data: booking } = await supabaseAdmin.from("bookings").select("*").eq("id", data.bookingId).single();
    if (!booking) throw new Error("Booking not found");
    if (booking.nurse_id && booking.nurse_id !== worker.id) throw new Error("Assigned to someone else");

    const amount = Number(booking.total ?? booking.amount ?? 0);
    const split = splitPayout(amount, Number(worker.rating));
    const patch: {
      nurse_id?: string;
      status?: string;
      nurse_share?: number;
      platform_share?: number;
      payment_status?: string;
    } = {};

    if (data.action === "accept") {
      patch.nurse_id = worker.id;
      patch.status = "Nurse Assigned";
      patch.nurse_share = split.nurse;
      patch.platform_share = split.platform;
    } else if (data.action === "transit") patch.status = "In Transit";
    else if (data.action === "active") patch.status = "Service Active";
    else if (data.action === "payment") patch.payment_status = data.payment ?? "Cash Collected by Nurse";
    else if (data.action === "complete") {
      const scanned = (data.qr ?? "").replace(/^SHUSHRUSHA:/i, "").replace(/^#/, "").trim().toUpperCase();
      if (!scanned) throw new Error("QR_REQUIRED");
      if (scanned !== String(booking.tracking_id).replace(/^#/, "").trim().toUpperCase())
        throw new Error("QR_MISMATCH");
      patch.status = "Completed";
      await supabaseAdmin
        .from("nurses")
        .update({ completed_visits: (worker.completed_visits ?? 0) + 1 })
        .eq("id", worker.id);
    }

    const { error } = await supabaseAdmin.from("bookings").update(patch).eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
