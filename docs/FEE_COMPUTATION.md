# Fee Computation

How the system computes the fee an applicant pays at the City Treasury. The
rules come from the City's **2013 Schedule of Fees**, and every application
type is covered:

| Application type | Priced by | Section of the schedule |
|---|---|---|
| Certificate of Zoning Compliance (CZC) | Category A–F + project cost | 1. Zoning / Locational Clearance |
| Temporary Use Permit (TUP) | Category A–F + project cost | 1. Zoning / Locational Clearance |
| Special Use Permit (SUP) | Category A–F + project cost | 1. Zoning / Locational Clearance |
| Zoning Certification (ZC) | **Fixed ₱720** | B. Other Certifications |

For CZC, TUP and SUP the Zoning Officer picks the category and the system
works out the fee from the project cost. Every ZC is ₱720. Either way the
amount is filled in automatically, and the officer can still change it.

---

## The key rule: "1/10 of 1%"

The top row of most categories reads like this:

> ₱720 + (1/10 of 1% of cost in excess of ₱200,000)

**1/10 of 1% is 0.1%, which is the same as dividing by 1,000.** The office's
shortcut of "dropping three zeros" gives the same answer.

### Worked example

A single house (Category A) with a project cost of **₱2,000,000**:

| Step | Computation | Result |
|---|---|---|
| Excess over ₱200,000 | 2,000,000 − 200,000 | ₱1,800,000 |
| 1/10 of 1% of the excess | 1,800,000 ÷ 1,000 | ₱1,800 |
| Add the base fee | 720 + 1,800 | **₱2,520** |

---

## The schedule

"Excess" always means the project cost minus the amount shown in that row.

### A. Single residential structure (attached or detached)

| Project cost | Fee |
|---|---|
| ₱100,000 and below | ₱288 |
| Over ₱100,000 to ₱200,000 | ₱576 |
| Over ₱200,000 | ₱720 + excess over ₱200,000 ÷ 1,000 |

### B. Apartments / Townhouses

| Project cost | Fee |
|---|---|
| ₱500,000 and below | ₱1,440 |
| Over ₱500,000 to ₱2,000,000 | ₱2,160 |
| Over ₱2,000,000 | ₱3,600 + excess over ₱2,000,000 ÷ 1,000 |

### C. Dormitories

| Project cost | Fee |
|---|---|
| ₱2,000,000 and below | ₱3,600 |
| Over ₱2,000,000 | ₱3,600 + excess over ₱2,000,000 ÷ 1,000 |

### D. Institutional

| Project cost | Fee |
|---|---|
| Below ₱2,000,000 | ₱2,880 |
| Over ₱2,000,000 | ₱2,880 + excess over ₱2,000,000 ÷ 1,000 |

### E. Commercial, Industrial and Agro-Industrial

| Project cost | Fee |
|---|---|
| Below ₱100,000 | ₱1,440 |
| Over ₱100,000 to ₱500,000 | ₱2,160 |
| Over ₱500,000 to ₱1,000,000 | ₱2,880 |
| Over ₱1,000,000 to ₱2,000,000 | ₱4,320 |
| Over ₱2,000,000 | ₱7,200 + excess over ₱2,000,000 ÷ 1,000 |

### F. Special uses / special projects

Gasoline stations, cell sites, slaughterhouses, treatment plants, etc.

| Project cost | Fee |
|---|---|
| Below ₱2,000,000 | ₱7,200 |
| Over ₱2,000,000 | ₱7,200 + excess over ₱2,000,000 ÷ 1,000 |

The printed schedule writes the "below ₱2M" row with the same formula as the
row above it. Below ₱2M there is no excess, so it comes out as a flat ₱7,200.

### G. Alteration / Expansion

"Same as the original application, affected areas/cost only." This is not a
separate category. The officer picks the category of the structure, and the
fee is computed on **the cost of the alteration or expansion only**. For an
application whose Project Nature is **Improvement**, the officer should check
that the project cost entered is the cost of the work, not the value of the
whole building.

### More examples

| Category | Project cost | Fee |
|---|---|---|
| A. Single house | ₱150,000 | ₱576 |
| A. Single house | ₱500,000 | ₱720 + ₱300 = **₱1,020** |
| B. Apartment | ₱3,000,000 | ₱3,600 + ₱1,000 = **₱4,600** |
| D. Institutional | ₱3,987,000 | ₱2,880 + ₱1,987 = **₱4,867** |
| E. Commercial | ₱1,500,000 | **₱4,320** |
| E. Commercial | ₱5,000,000 | ₱7,200 + ₱3,000 = **₱10,200** |

---

## Zoning Certification (ZC)

From **B. Other Certifications — 1. Zoning Certifications**.

**Every Zoning Certification costs ₱720.** Nothing changes it: no category,
no project cost, no lot area. The printed schedule reads "₱720/ha", but the
office charges the same fixed ₱720 whatever the lot size.

---

## How the system applies the schedule

- **Which applications.** CZC, TUP and SUP use categories A–F and the project
  cost. ZC is a fixed ₱720 (above). *(Whether TUP and SUP
  use the same Section 1 rows as CZC is pending confirmation — see Open
  questions.)*
- **Exact boundary amounts.** A cost exactly on a boundary falls into the
  **lower** row. Example: a single house at exactly ₱200,000 pays ₱576. Where
  the printed schedule leaves an exact amount uncovered ("Below ₱100,000" /
  "Over ₱100,000"), the lower row is used too: Commercial at exactly ₱100,000
  pays ₱1,440. *(Pending the office's confirmation — see Open questions.)*
- **Jumps between rows.** The schedule is followed as printed, even where the
  fee jumps at a boundary. Commercial at ₱2,000,000 pays ₱4,320, but at
  ₱2,000,001 it pays ₱7,200. *(Pending confirmation.)*
- **Rounding.** Fees are rounded to the centavo, with .5 rounded up. A single
  house costing ₱2,345,678.50 has an excess of ₱2,145,678.50. That ÷ 1,000 is
  ₱2,145.6785, which rounds to ₱2,145.68, for a fee of **₱2,865.68**.

---

## Using it (Zoning Officer)

On **View Application → Review & Decision**:

1. Choose **Mark as Reviewed**. The **Fee Computation** box appears.
2. *(CZC, TUP, SUP)* Check the **Category**. The system pre-selects one from
   the land use the applicant entered:

   | Applicant's land use | Suggested category |
   |---|---|
   | Residential | A. Single residential |
   | Institutional | D. Institutional |
   | Commercial, Industrial | E. Commercial / Industrial |
   | Vacant, Tenanted, Not Tenanted, Agricultural | none — choose one |

   This is only a starting point. "Residential" can mean a house (A), an
   apartment (B) or a dormitory (C). Land uses like Vacant describe the land,
   not the project. Always confirm the category fits the actual project.
   *(ZC)* There is no category and nothing to enter; the box shows the fixed
   ₱720.
3. The box shows the working and the **schedule fee**. The **Amount to Pay at
   the Treasury** is filled in with that fee.
4. If a different amount is needed, type it in. The screen warns "Differs from
   the schedule fee". **Use the schedule fee** puts the computed fee back.
5. Submit the review as usual. The confirmation dialog shows the amount, the
   category, and the working. It says "overridden" if the amount was changed.

**No project cost on file** (CZC, TUP, SUP): the box asks for it. Type the
cost and click **Compute Fee**. It is saved as the application's project
cost; then choose a category and the amount fills in.

**Wrong cost:** click **Change** next to the project cost, enter the corrected
cost and click **Compute Fee**. The amount is recomputed.

**No category pre-selected** (the land use is Vacant, Tenanted, Not Tenanted
or Agricultural): the amount stays empty until a category is chosen.

---

## What gets recorded

Each review stores three values on the application's report:

| Field | Meaning |
|---|---|
| `payment_amount` | The amount the applicant actually pays (what the officer submitted). |
| `fee_category` | The category (A–F) the officer chose, or `ZC` for a Zoning Certification. |
| `computed_fee` | What the schedule gives: for A–F, from the category and project cost; for `ZC`, always ₱720. |

When `payment_amount` and `computed_fee` differ, the officer overrode the
schedule. The review is also written to the audit log, as before.

`computed_fee` is always recomputed by the server from what is on file. A
figure sent from the browser is never trusted. If a CZC, TUP or SUP review is
submitted with no category chosen or no project cost, `fee_category` and
`computed_fee` are left empty and only the officer's amount is kept.

---

## For developers

### Where the code lives

| File | Role |
|---|---|
| `app/Support/ZoningFeeSchedule.php` | The schedule itself and all fee arithmetic. **The only place fees are defined.** |
| `app/Http/Controllers/AdminController.php` | `viewApplication` sends the fee figures (`fee_quotes`: every category A–F, or the single ZC figure) and the suggested category; `reviewApplication` stores `fee_category` / `computed_fee`; `updateApplicationDetails` saves a project cost entered from the fee box. |
| `resources/js/Components/Applications/OfficerDecision.jsx` | The Fee Computation box. Displays the server's figures only — it does no fee arithmetic. When the project cost is missing it saves one through `/admin/requests/{id}/application-details` and reloads the page's `request` to get the new figures. |
| `resources/js/Pages/Admin/ViewApplication.jsx` | Reloads the fee figures after the officer saves a new project cost. |
| `database/migrations/2026_10_02_230530_add_fee_category_to_reports_table.php` | Adds `fee_category` and `computed_fee` to `reports`. |

### How the arithmetic works

All amounts are handled in whole **centavos** (integers) so no floating-point
error can creep in. Each category is a list of rows:

```php
['up_to' => 200_000, 'base' => 576],                               // flat fee
['up_to' => null,    'base' => 720, 'excess_over' => 200_000],     // base + excess ÷ 1,000
```

The first row whose `up_to` is at or above the cost is used (`up_to` is
inclusive; `null` means no upper limit). The excess part is
`(excess_centavos + 500) intdiv 1000`, which is ÷ 1,000 rounded half-up.

### Changing the schedule

- **A fee amount:** edit that row's `base`.
- **A boundary:** edit that row's `up_to`. For example, to move Commercial at
  exactly ₱100,000 into the ₱2,160 row, change E's first row to
  `'up_to' => 99_999.99`.
- **The Zoning Certification fee:** `ZONING_CERTIFICATION_FEE`.
- **Which application types use categories A–F:** `ZoningFeeSchedule::appliesTo()`
  and the matching `feeScheduleApplies` check in `OfficerDecision.jsx`.
- **The land-use suggestions:** `ZoningFeeSchedule::suggestCategory()`.

After any change, update `tests/Unit/ZoningFeeScheduleTest.php`, which checks
every row, the boundaries, the rounding, the fixed ZC fee and the office's
₱2,520 example. Then run `php artisan test`.

### Deploying

The live server needs `php artisan migrate` (for the two new `reports`
columns), followed by:

```
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

---

## Open questions

These are being confirmed with the office. The system currently does what is
described above.

1. **Boundary amounts.** Should exactly ₱100,000 for Commercial (E) be ₱1,440
   or ₱2,160?
2. **Jumps between rows.** Are the large jumps (e.g. Commercial ₱4,320 →
   ₱7,200 just over ₱2M; single house ₱576 → ₱720 just over ₱200,000) correct
   as printed?
3. **Rounding.** Centavo with .5 rounded up is in place for now. Does the
   Treasury round to the whole peso instead?
4. **TUP and SUP.** Do Temporary Use Permits and Special Use Permits pay from
   the same Section 1 rows as a CZC, or does the full Schedule of Fees have
   separate rows for them?
