# Shushrusha — Booking, Admin, Nurse & Quiz Upgrade

## 1. Nursing booking wizard
- Ask "ইনজেকশন দিতে হবে কি?" with হ্যাঁ / না buttons. Choosing হ্যাঁ shows the medicine search. Results list each brand with its strengths and prices, e.g. "Ceftron 500mg - ৳150".
- Add a "ক্যানুলা প্রয়োজন?" toggle. Choosing হ্যাঁ adds the cannula kit fee automatically. The admin can change the fee under service prices.
- Fix the price calculation. The total is (pushes × price per push) + medicine + cannula + vitals + visit charge − discounts. The visit charge is always added.
- Add a multi-line box for medical instructions just before checkout.
- Add a "Shushrusha Cash" option at checkout that turns quiz points into a discount.

## 2. Admin panel
- **Quiz Manager tab:** add, edit and delete questions. Each question has the question text, options A–D, the correct option, reward points and negative-mark points.
- **Banners:** fix the homepage carousel so it slides on its own and responds to swipes. The admin can add, edit, turn on/off and reorder banners (up/down) with an image and a link.
- **Doctors:** full editing of name, specialty, chamber address, fee and photo link for existing doctors.
- **Finance:** cash collected on-site appears in the admin money summary with the nurse, amount and time.

## 3. Nurses
- **Approving an application:** the admin enters an email and password. The nurse can then sign in to the nurse dashboard right away with that email (or the nurse ID) and password.
- **"Scan Cash QR" button:** the nurse scans the patient's order QR, confirms the amount, and the order is marked "Paid (Cash)". The cash is logged for the admin.
- **"Case Updates & News" tab:** the admin posts notices and nurses read them on their dashboard.
- **Quick message buttons in nurse chat:**
  - "স্বাগতম! আমি আপনার দায়িত্বপ্রাপ্ত নার্স।"
  - "অতিরিক্ত সার্ভিস / ড্রেসিং সামগ্রীর ফি বিবরণী", where the nurse types an amount and it is sent as a fee message.

## 4. Patient inbox
- Three tabs: **Chats** (order chats with nurses), **Promotions** and **Health Tips**. Existing saved data stays.

## 5. Shushrusha Cash quiz (/quiz)
- Questions in Medical Admission and BCS Health style come from the Quiz Manager. The page includes starter questions.
- A correct answer adds the question's points. A wrong answer takes away the negative mark points. The balance never goes below 0.
- The balance shows on the profile (More page) and can be used as a discount at checkout. The existing /med-gamer link opens /quiz.

## Technical details
- New tables: `quiz_questions` (public can read active questions, admin writes through server functions), `nurse_notices`, `cash_collections`. Add `email` and `password_hash` to `nurses` and `cannula_fee` and `visit_charge` to the settings. Every table gets grants and access rules.
- Sign-in for nurses checks the email or nurse ID against a hashed password. The old PIN still works as a fallback.
- The Cash QR uses the existing order QR scanning (jsqr). A worker server function checks the nurse's session token and that the booking is assigned to them before writing.
- Shushrusha Cash is stored on the device under the existing points key, so the current balance carries over. The checkout discount uses the existing points-to-taka rule (100 points = ৳10).
- The carousel uses an interval plus touch start/end handling, and pauses while the user is touching it.
