# Shushrusha — Feature Upgrade, bKash Payment & Monitored Chat

A large upgrade in six parts. Doctors, lab tests, banners, services, nurse credentials and chat messages move into the shared backend so the admin, nurses and patients all see the same data. The visual theme, Bangla copy and mobile-first layout stay exactly as they are.

## 1. Admin control centre (`/admin`)

New tabs added to the existing password-protected admin area:

- **Applications** — nurse/caregiver applications submitted from the career page appear here. "Approve & Generate Credentials" opens a modal where the admin sets a custom Nurse ID and a login password; approving creates the nurse record so they can sign in on the nurse dashboard.
- **Hero Banners** — add/edit/reorder homepage banner image, promo title, discount text and link.
- **Doctors** — name, photo, specialty, chamber address, consultation fee, active toggle.
- **Lab Tests** — test name, price, diagnostic partner, patient instructions.
- **Services & Prices** — add new nursing service items and edit charges; the booking wizard reads these prices.
- **Live Nurse–Patient Chats** — all active threads listed with the latest message; the admin can open any thread, read everything, and post a support message inside it as "Shushrusha Support".
- Orders list shows the green "PAID via bKash" badge and transaction ID.

## 2. Doctor consultation & lab tests

- All direct WhatsApp jumps removed from doctor specialty cards.
- New `/doctors/$specialty` page: doctor cards with photo, name, chamber, fee and star rating, sorted highest-rated first, a "Rate Doctor" review modal, and "Book Appointment" opening an in-app appointment wizard (patient, date, time slot, payment) that writes into the same order list.
- New `/lab-tests` page: browse admin-added tests, tick tests for home sample collection, enter address and preferred collection slot, then confirm — also recorded as an order.

## 3. Medical store overhaul (`/store`)

- Modern product cards with image, category tag, price and a Buy / Rent toggle for equipment.
- Search field plus category filter (Oxygen Cylinders, Hospital Beds, Mobility, Monitors, Consumables) as a sidebar on desktop and a filter row on mobile.
- Refined sliding cart drawer: line items, promo, totals, and the new payment step.

## 4. Nursing booking engine (`/booking/nursing`)

- **Medicine autocomplete** for injection push — typing "Cef" suggests matching brands from the existing medicine list, with strength and price.
- **Body-part selector** restored for stitching/dressing: tappable body diagram that highlights and zooms the chosen region, plus an animated stitch counter with + / − buttons.
- **Multi-dose scheduling** — choose 1, 2, 3, 7 or 10 doses and pick a date and time slot for each dose (or apply one recurring slot to all).
- Prices pulled from the admin-managed service list.

## 5. bKash payment gateway

- "bKash Online Payment" added as a featured option (pink #D12053 with bKash branding) next to Cash on Service and Shushrusha Wallet — in the nursing wizard, store checkout, doctor appointments and lab bookings.
- Simulated 4-step bKash checkout modal: merchant "Shushrusha Care" + amount + account number → OTP screen (demo `123456`) → PIN screen (demo `1234`) → success screen with generated transaction ID (e.g. `BK8X92M10A`) and success animation.
- Admin can save a real bKash merchant payment link; when present, the modal offers a direct redirect to it instead of the simulation.
- Orders store `paymentStatus: "Paid"`, `paymentMethod: "bKash PGW"` and `trxId`; a green "PAID via bKash" badge with the TrxID shows in `/orders` and `/admin`.

## 6. Monitored nurse–patient chat

- **Nurse dashboard**: chat with the assigned patient for an active order — text plus progress/wound photo upload, quick-template buttons ("On my way", "Reached location", "Service completed"), and the red warning banner: "⚠️ এই চ্যাটটি অ্যাডমিন টিম দ্বারা সার্বক্ষণিক মনিটর করা হচ্ছে। অ্যাপের বাইরে ব্যক্তিগত যোগাযোগ, নম্বর আদান-প্রদান বা লেনদেন করা কঠোরভাবে নিষিদ্ধ।"
- **Patient inbox** (`/inbox`): the same thread, live-updating, with the same banner.
- **Admin**: full oversight and the ability to join any thread.

## Technical notes

- New backend tables: `doctors`, `doctor_reviews`, `lab_tests`, `hero_banners`, `services`, `nurse_applications`, `chat_threads`, `chat_messages`, plus `payment_status` / `trx_id` / `paid_at` columns on `bookings` and a small `app_settings` row for the bKash merchant link. Each table gets grants and RLS: public read for catalogue-style data (doctors, tests, banners, services), writes and chat access through password-checked admin server functions and nurse/patient-scoped server functions.
- Chat uses Supabase realtime for live updates, with the last-known thread cached in `localStorage` (`shushrusha_chats`) so the inbox renders instantly offline.
- Orders keep flowing through the existing unified `shushrusha_orders` localStorage store, extended with the payment fields; nothing already saved is lost.
- New routes: `/doctors/$specialty`, `/lab-tests`. New components under `src/components/doctors/`, `src/components/lab/`, `src/components/payment/BkashCheckout.tsx`, `src/components/chat/`. Nurse credential checks stay server-side.
- Photos are compressed client-side (existing helper) and stored as data URLs, consistent with the current chat.

## Build order

1. Database migration for all new tables and columns.
2. Admin tabs (applications/credentials, banners, doctors, lab tests, services, bKash link).
3. Doctor list + rating + appointment wizard; lab tests page; remove WhatsApp redirects.
4. Store UI overhaul.
5. Booking wizard upgrades (medicine search, body selector, multi-dose).
6. bKash checkout modal wired into all four checkout points; badges in orders/admin.
7. Monitored chat: nurse dashboard, patient inbox, admin audit tab.
