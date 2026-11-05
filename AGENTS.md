<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Order routing uses `bookings.category` (`nursing|lab|doctor|store`): the nurse dashboard queue reads only `nursing`; the admin bookings panel filters lab/doctor/store via queue chips. Any new booking writer must set `category`.
- All booking pricing goes through `src/lib/pricingCalculator.ts` (`calculatePricing`): visit/delivery fee added once, per-dose discounted medicine price from `injectionNet()` (`injection_discount_pct` in `app_settings`), cannula fee, promo and Shushrusha Cash deductions.
- Real bKash Tokenized Checkout lives in `src/lib/bkash.server.ts` + `src/lib/bkash.functions.ts` + `src/routes/api/public/bkash.callback.ts`; credentials come from secrets `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD` (sandbox by default); orders are persisted unpaid before the gateway redirect, and the demo checkout remains when creds are absent.
- Injection medicine prices in `src/lib/injections.ts` are approximate reference MRPs, not verified official prices; the admin sets the discount percentage, never per-item edited prices here.
