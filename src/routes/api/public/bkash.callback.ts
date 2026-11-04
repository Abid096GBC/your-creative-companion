// ============= Full file contents =============
import { createFileRoute } from "@tanstack/react-router";
import { bkashExecutePayment, bkashGrantToken, readBkashCreds } from "@/lib/bkash.server";

/**
 * bKash Tokenized Checkout callback (public — the caller is bKash itself).
 * bKash redirects the payer back here with ?paymentID=…&status=… appended to
 * our callbackURL (which already carries ?trackingId=SHU-xxxx). On success we
 * execute the payment and mark the booking paid, then send the user to /orders.
 */
export const Route = createFileRoute("/api/public/bkash/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = url.origin;
        const trackingId = (url.searchParams.get("trackingId") ?? "").trim().toUpperCase();
        const paymentID = (url.searchParams.get("paymentID") ?? "").trim();
        const status = (url.searchParams.get("status") ?? "").trim();
        const fail = () => Response.redirect(`${base}/orders?bkash=failed&id=${encodeURIComponent(trackingId)}`, 302);
        if (!trackingId) return fail();
        if (status !== "success" || !paymentID) return fail();
        try {
          const creds = readBkashCreds();
          if (!creds) return fail();
          const token = await bkashGrantToken(creds);
          const exec = await bkashExecutePayment(creds, token, paymentID);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("bookings")
            .update({
              payment_status: "Paid",
              payment_method: "bKash PGW",
              trx_id: exec.trxID,
              paid_at: new Date().toISOString(),
            })
            .eq("tracking_id", trackingId);
          return Response.redirect(
            `${base}/orders?bkash=success&id=${encodeURIComponent(trackingId)}&trx=${encodeURIComponent(exec.trxID)}`,
            302,
          );
        } catch {
          return fail();
        }
      },
    },
  },
});
