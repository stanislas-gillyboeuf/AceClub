---
created_at: 2026-05-12T07:15:41.008474+00:00
updated_at: 2026-05-12T07:15:41.008474+00:00
category: project_memory
source: dream
tags: ["events", "payment", "lydia", "ux"]
---

# Event payment flow — Lydia before inscription

For paid events, the UX flow is: Lydia (payment link) opens first, then the inscription request is sent.

**Why:** User wants the payment to happen before confirming inscription, not after. "Lydia puis inscription" — the payment intent comes first.

**How to apply:** Any future work on event RSVP/payment flows must preserve this order: open `event.paymentLink` via `Linking.openURL`, then call the inscription mutation. Do not gate the payment link behind a successful inscription.
