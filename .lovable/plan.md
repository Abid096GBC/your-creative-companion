# Shushrusha Homepage — Arogga-style Mobile-First Redesign

Rebuild the top of the homepage (`/`) as a modern health-tech surface, mobile-first, reusing the existing theme tokens, shadcn components and Lucide icons. Existing booking wizard, store, tracking and admin flows stay untouched; the new sections sit above them and link into them.

## 1. Header & search
- Compact sticky header: Shushrusha (শুশ্রূষা) brand with care icon on the left, existing call/WhatsApp actions condensed on mobile.
- "Select Location ▾" button (map pin + chevron) under the brand. Opens a dialog to enter/pick a home address; saved to local storage and shown as the button label on return visits.
- Full-width search bar below: search icon, placeholder "Search Nursing Services, Doctors, Lab Tests, Equipment...", mic icon on the right. Typing filters a dropdown of services/store items; mic uses browser speech recognition when available and is hidden otherwise.

## 2. Hero promo carousel
- Auto-advancing, swipeable carousel of 3–4 offer slides (nursing discount, injection service, lab tests, equipment rental) on gradient backgrounds with dot indicators and pause on hover.

## 3. Primary services grid
2x2 on mobile, 4 columns on desktop:
- Home Nursing & Care — featured card (larger emphasis, gradient border/badge): Dressing, Injection, Post-Surgery, Elderly Care, Physiotherapy
- Doctor Consultation — Specialist Doctor Appointments
- Lab Tests — Home Sample Collection
- Medical Store — Buy & Rent Medical Equipment

Nursing and Store cards link to the existing wizard/store; Doctor Consultation and Lab Tests are presented as upcoming/enquiry (WhatsApp) since no backend exists for them.

## 4. OshudShonggi banner
Full-width card: title "OshudShonggi (ওষুধসঙ্গী) — AI Health & Medicine Assistant", red/gold "COMING SOON" badge, description line, subtle glow styling.

## 5. Today's Patient Vitals widget
Summary card with BP, Blood Sugar, Pulse Rate tiles and an overall Green/Yellow/Red trend tag. Values come from local state (last entered by the user) with an empty state and a CTA into the existing Vitals Check booking; no new database work.

## Technical notes
- New components under `src/components/home/`: `LocationPicker`, `HomeSearch`, `PromoCarousel`, `ServiceGrid`, `OshudShonggiCard`, `VitalsWidget`; composed in `src/routes/index.tsx`.
- Styling only via existing semantic tokens in `src/styles.css`; add any new gradient/status tokens there rather than hardcoded colors.
- Responsive rules follow the grid + `min-w-0` + `shrink-0` pattern; touch targets ≥44px.
- Location and vitals persist in local storage, read in `useEffect` to avoid hydration mismatch.
- Route `head()` metadata for `/` refreshed to match the new positioning.
