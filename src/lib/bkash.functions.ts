// ============= Full file contents =============
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/start-server-core";
import { z } from "zod";
import { bkashCreatePayment, bkashGrantToken, readBkashCreds } from "@/lib/bkash.server";

/** Whether real bKash Tokenized Checkout credentials are configured. */
export const bkashMode = createServerFn({ method: "GET" }).handler(async () => ({
  live: Boolean(readBkashCreds()),
}));

/** Creates a tokenized bKash payment for an existing booking and returns the payment URL. */
export const bkashStart = createServerFn({ method: "POST" })
  .inputValidator((data: { trackingId: string; amount: number; phone: string }) =>
    z
      .object({
        trackingId: z.string().trim().min(3).max(40),
        amount: z.number().min(1).max(200000),
        phone: z.string().trim().max(20).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const creds = readBkashCreds();
    if (!creds) return { live: false as const };
    const origin = getRequestHeader("origin") || "";
    if (!origin) throw new Error("No request origin");
    const callbackURL = `${origin}/api/public/bkash/callback?trackingId=${encodeURIComponent(data.trackingId)}`;
    const token = await bkashGrantToken(creds);
    const payment = await bkashCreatePayment(creds, token, {
      amount: data.amount,
      invoice: data.trackingId,
      callbackURL,
      payerReference: data.phone || "Shushrusha",
    });
    return { live: true as const, url: payment.paymentURL, paymentID: payment.paymentID };
  });
