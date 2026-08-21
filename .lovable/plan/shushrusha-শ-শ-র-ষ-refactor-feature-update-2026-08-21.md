# Shushrusha (শুশ্রূষা) — Refactor & Feature Update

This project is currently the blank starter. The Shushrusha app lives in another Lovable project (`1edd403a-4eff-4e77-ac25-f12ae9c3f11a`), so step 0 is to switch to that codebase and work there. Everything below is then applied to the existing components, keeping the current theme, structure and responsive layout.

## 0. Switch to the real project
Check out project `1edd403a-4eff-4e77-ac25-f12ae9c3f11a`, review its routes/components/database, and confirm the current state before editing. If that ID is wrong, tell me the right one.

## 1. Service Booking Wizard
- **Injection Push**: dose-count selection, plus a "Split Time Slot" picker so each dose can be scheduled at a different time.
- **Nebulizer**: split time slots for multiple sessions. For "Rent Machine", split slots plus a live "X Machines Available" indicator driven by real inventory data.
- **Saline & IV Setup**: remove "Only Cannula (শুধু ক্যানুলা)". Require Saline Type (NS / DNS / Cholera Saline), then show the drug/saline name field and patient details, mirroring the Injection Push flow.
- **Vitals Check (BP / Sugar / O2)**: bundled auto-pricing — 1 test ৳100, 2 tests ৳150, 3 tests ৳200, recalculated live as checkboxes change.

## 2. Surgical Store & Cart
- Fix broken product images (proper storage URLs, fallback placeholder, correct aspect ratio on cards).
- Replace the inline cart that pushes content down with a slide-over floating Cart Drawer opened on "Add to Cart".
- Drawer supports multiple items: quantity +/- , remove, live subtotal/total.
- Checkout creates one order with a single unified Order Tracking Code for the whole purchase.

## 3. Admin Dashboard
- **Dual AI**: separate tabs — "MedGemma" strictly for medical record / prescription image analysis (image upload + vision analysis), and "AI Assistant" for general text chat. Both run server-side through Lovable AI.
- **Nurse & Worker Database**: registration form/modal with profile photo upload, role tags, phone/address, plus a searchable list.
- **Products & Pricing**: fix the product form — image upload, original price vs discounted price with auto discount %, stock.
- **Promo Code Engine**: dedicated Promo & Coupon Management view — create/edit/delete codes, flat ৳ or % discount, min order, usage limit, validity dates; applied at checkout.
- **Worker Assignment**: "Assign Nurse/Worker" dropdown/action next to each pending order in the bookings table; assignment moves the order to "Nurse Assigned".

## 4. Order Tracking & QR Completion
- Public tracking page: enter tracking code → live status timeline (Pending → Nurse Assigned → In Transit → Active → Completed).
- When the order is active, the customer's tracking screen shows a unique patient QR code.
- Nurse/worker view gets a camera QR scanner; a valid scan of that order's code marks it Completed server-side (token verified, only the assigned worker can complete).

## Technical notes
- Lovable Cloud (database, auth, storage, server functions) powers orders, tracking codes, nurses/workers, products, promo codes and machine inventory; images go to storage buckets with RLS.
- Tracking codes and QR tokens are generated server-side; completion is validated in a server function, never trusted from the client.
- AI features run through the Lovable AI Gateway in server functions so no key touches the browser.
- New tables get RLS policies plus grants: public read for products/promos, customer-scoped reads for orders (tracking code lookup via a safe server function), admin/worker-only writes.
- Cart drawer, wizard steps and admin views reuse existing shadcn components (Sheet, Dialog, Tabs, Table) to keep styling consistent; no route renames.

## Rollout order
1. Checkout the project, audit code + schema.
2. Database migrations (nurses, machines, promo codes, order items, tracking/QR fields).
3. Booking wizard updates.
4. Store + cart drawer + unified order.
5. Admin dashboard sections.
6. Tracking page + QR scan completion.
