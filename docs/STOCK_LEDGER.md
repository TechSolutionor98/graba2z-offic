# The stock ledger

Until this was built, nothing in the system recorded a change to a product's
stock figure — and orders were not reducing it either. The In / Out / Damage
columns on Store Stats would have been invented numbers, so the ledger came
first.

---

## What it is

`server/models/stockMovementModel.js` — an append-only record. One row per
movement:

| Field | Meaning |
|---|---|
| `product` | which product moved |
| `type` | `in` (opening count, supplier delivery, customer return), `out` (sold), `damage` (broken, lost, stolen, unsellable) |
| `quantity` | always positive — the type carries the direction |
| `reason` | plain words, e.g. "Sold on order #4F2A1C" |
| `order` | the order it came from, when it came from one |
| `postedBy` | who posted it, when a person did |
| `stockAfter` | the stock level once this movement was applied |

`stockAfter` is stored so a single row can be read on its own — "we had 12 left
after that sale" — without replaying every movement before it.

**Nothing is ever edited or deleted.** A mistake is corrected by posting the
opposite movement, so the history stays truthful.

---

## Writing to it

`postStockMovement()` in `server/utils/stockLedger.js` is the only thing that may
change `countInStock`. It posts the ledger row and moves the stock figure
together. Anything that changed the figure on its own would put the two out of
step, and once they disagree neither can be trusted.

Two properties it is built around:

1. **The adjustment is an atomic `$inc`, never read-then-write.** Two orders
   landing in the same moment would otherwise both read the same figure and both
   write their own answer back, losing one sale's worth of stock. The database
   does the arithmetic.
2. **It never throws.** It runs while an order is being placed, and a ledger
   problem must not fail a sale the customer has already paid for. Failures are
   logged and `null` comes back.

---

## Where orders connect

| Event | What happens | Where |
|---|---|---|
| Order placed | one `out` per physical line, **awaited** | `routes/orderRoutes.js` |
| Order cancelled | one `in` per line, guarded | `routes/orderRoutes.js`, `routes/adminRoutes.js`, `routes/whatsappRoutes.js` |

The order-placed call is awaited, unlike the notifications beside it: an order
that does not move stock leaves the shop overselling the next customer.

**The cancellation is guarded against running twice.** `recordOrderCancelled()`
checks whether a return has already been posted for that order before posting
another; without it, re-saving a cancelled order silently inflates stock. The
guard *fails closed* — if it cannot be checked, nothing is posted, because an
under-return is visible and fixable while a silent double-return is not.

Warranty and buyer-protection lines are skipped: nothing leaves a shelf for them.

**Not covered:** a status of `Returned` does not put stock back. Returned goods
may come back damaged, and which of `in` or `damage` they are is a judgement a
person makes. Post it by hand.

---

## The opening balance

The ledger starts empty while the catalogue already holds stock, so without an
opening entry the In column reads zero beside a Stock column showing hundreds —
the row does not add up and the page looks broken.

```
npm run stock:backfill-opening:dry    # see what it would do
npm run stock:backfill-opening        # do it
```

One `in` movement per product, equal to the stock it already holds, reasoned
"Opening stock". It does not touch any stock figure — it records what is already
there.

It is **idempotent**: any product that already has an opening entry is skipped,
so a second run creates nothing. Products holding nothing are skipped too, so
their first real delivery is their first entry.

Run this once, before anyone is shown the new columns.

---

## The acceptance test

For every row on Store Stats:

```
In − Out − Damage = Stock
```

If a row does not reconcile, something wrote to `countInStock` behind the
ledger's back. The columns should be believed over the figure.

A dash, not a zero, is shown where nothing has ever moved; damage shows in a
warning colour when it is not zero.
