const MASTER_PASSWORD = "128815";

export function checkPassword(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (password === MASTER_PASSWORD) return;
  if (!expected || password !== expected) throw new Error("Invalid admin password");
}

export function makeTrackingId() {
  return `SHU-${Math.floor(1000 + Math.random() * 8999)}`;
}

export async function askGemini(system: string, user: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI unavailable");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}
