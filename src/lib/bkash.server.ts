// ============= Full file contents =============
/**
 * Server-only helpers for the bKash Tokenized Checkout gateway.
 * Credentials come from project secrets:
 *   BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD
 *   (optional BKASH_BASE_URL — defaults to the sandbox API).
 * When any credential is missing the app falls back to the demo checkout.
 */

export type BkashCreds = {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  base: string;
};

export function readBkashCreds(): BkashCreds | null {
  const appKey = process.env["BKASH_APP_KEY"];
  const appSecret = process.env["BKASH_APP_SECRET"];
  const username = process.env["BKASH_USERNAME"];
  const password = process.env["BKASH_PASSWORD"];
  if (!appKey || !appSecret || !username || !password) return null;
  return {
    appKey,
    appSecret,
    username,
    password,
    base: (process.env["BKASH_BASE_URL"] || "https://tokenized.sandbox.bka.sh/v1.2.0-beta").replace(/\/$/, ""),
  };
}

export async function bkashGrantToken(c: BkashCreds): Promise<string> {
  const res = await fetch(`${c.base}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: c.username, password: c.password },
    body: JSON.stringify({ app_key: c.appKey, app_secret: c.appSecret }),
  });
  const json = (await res.json()) as { id_token?: string; statusMessage?: string };
  if (!res.ok || !json.id_token) throw new Error(json.statusMessage || "bKash token failed");
  return json.id_token;
}

export async function bkashCreatePayment(
  c: BkashCreds,
  token: string,
  opts: { amount: number; invoice: string; callbackURL: string; payerReference: string },
): Promise<{ paymentID: string; paymentURL: string }> {
  const res = await fetch(`${c.base}/tokenized/checkout/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: c.username, password: c.password },
    body: JSON.stringify({
      mode: "0011",
      payerReference: opts.payerReference,
      callbackURL: opts.callbackURL,
      amount: String(opts.amount),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: opts.invoice,
    }),
  });
  const json = (await res.json()) as { paymentID?: string; bkashURL?: string; statusMessage?: string };
  if (!res.ok || !json.paymentID || !json.bkashURL) throw new Error(json.statusMessage || "bKash create failed");
  return { paymentID: json.paymentID, paymentURL: json.bkashURL };
}

export async function bkashExecutePayment(
  c: BkashCreds,
  token: string,
  paymentID: string,
): Promise<{ trxID: string; status: string }> {
  const res = await fetch(`${c.base}/tokenized/checkout/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", username: c.username, password: c.password },
    body: JSON.stringify({ paymentID }),
  });
  const json = (await res.json()) as { transactionStatus?: string; trxID?: string; statusMessage?: string };
  if (!res.ok || !json.trxID || json.transactionStatus !== "Completed")
    throw new Error(json.statusMessage || "bKash execute failed");
  return { trxID: json.trxID, status: json.transactionStatus ?? "" };
}
