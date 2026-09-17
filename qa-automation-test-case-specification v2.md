# Test Case Specification — Playwright Automation Candidates
## Accent Decor — Magento 2.4.8, derived from Admin QA Tracker + P5 Staging Plan

**Status:** Draft — gap analysis and structured outline, not executable test code.
**Purpose:** Convert every case in the two manual QA trackers into a structured automation candidate (title, priority, readiness, data needed) so we know exactly what can be built now vs. what needs staging access or clarification first. Full step-by-step Playwright specs are written out for the subset that already has enough detail to implement directly (§5).

---

## 1. How to read this doc

Each functional area below is a table of test cases carried over from the source tracker, with an **Automation Readiness** rating:

| Rating | Meaning |
|---|---|
| 🟢 **Ready** | Steps and expected result are specific enough to write assertions directly once we have staging access and selectors. |
| 🟡 **Needs detail** | The tracker row is a one-line goal (e.g., "verify X works") without specified test data, exact expected values, or edge cases — needs a short clarifying conversation with QA/business before it's deterministic enough to automate reliably. |
| 🔴 **Not UI-automatable as-is** | Requires server/API/log access rather than browser automation, or is fundamentally exploratory. |

Every case also needs two things this doc *cannot* supply on its own, regardless of rating: **staging environment access** (URL + credentials) and **selector discovery** (via `playwright codegen` against the real pages). Those are called out once in §6 rather than repeated per row.

Original tracker IDs are preserved where they exist (`ADM-`, `AP-`, `PS-`). The P5 storefront plan doesn't use IDs for most sections — I've assigned working IDs (`REG-`, `CAT-`, `CART-`, `MC-`, `CHK-`, `MIN-`, `DS-`, `AVA-`, `FOR-`) purely for traceability in this doc; confirm with the team whether these should become the real convention or whether IDs should be assigned differently when the tracker itself is updated.

---

## 2. Admin QA Tracker — Automation Candidates (65 cases)

### Admin Access
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-001 | Admin login with valid credentials | Critical | 🟢 | Straightforward smoke test — good first migration candidate alongside storefront Registration/Login. |
| ADM-002 | Invalid Admin login and lockout behavior | High | 🟡 | Need the exact lockout threshold (attempts count) and lockout duration to assert precisely. |
| ADM-003 | Admin logout and session timeout | High | 🟡 | Need the configured timeout duration to assert against (or a mechanism to fast-forward/mock time). |
| ADM-004 | Admin role and ACL boundaries | High | 🟡 | Need the actual "representative roles" and which menus each should/shouldn't see — the tracker references a role matrix not included in this file. |
| ADM-005 | Admin user create/edit/save | Medium | 🟢 | Standard CRUD check once we have a safe test-user creation path. |
| ADM-006 | Admin audit/system activity visibility | Medium | 🟢 | |

### Configuration
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-007 | Save Stores > Configuration | Critical | 🟢 | Need to confirm which "safe scoped setting" is approved to toggle repeatedly in an automated run. |
| ADM-008 | Verify base URLs and scope inheritance | Critical | 🟡 | Expected values (the actual base URLs per scope) need to be supplied as environment config, not hardcoded. |
| ADM-009 | Verify media base URLs | Critical | 🟡 | Same — needs actual expected media domain. |
| ADM-010 | Verify cookie domain and secure cookie settings | High | 🟡 | Needs expected cookie domain/flags to assert against. |
| ADM-011 | Verify locked environment values | High | 🔴 | Requires reading `env.php`/`config.php` on the server — not browser-reachable; likely a small separate script, not Playwright. |

### Cache / Index
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-012 | Cache Management status | High | 🟢 | |
| ADM-013 | Indexer status and mode | Critical | 🟢 | |
| ADM-014 | Static asset and media cache request | High | 🟢 | Need a representative CSS/JS/image path list. |

### Catalog
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-015 | Create simple product | High | 🟢 | **Known open defect** in the tracker: save succeeds but a "service unavailable" error displays. Automate this now — it locks in a regression test that will catch when the fix lands (and catches any recurrence). |
| ADM-016 | Edit and save product attributes | High | 🟢 | Same known defect as ADM-015. |
| ADM-017 | Configurable product child resolution | Critical | 🟡 | Need the specific SKU/attribute combinations used as the "representative configurable" product. |
| ADM-018 | Product image roles and gallery | High | 🟡 | Need a defined test product with a known multi-image gallery and expected role mapping. |
| ADM-019 | Product status and visibility | High | 🟢 | |
| ADM-027 | Product price by customer group | Critical | 🟡 | Need expected price per group (COT/US/Drop Ship) for a specific test SKU. |
| ADM-028 | Tier price and minimum quantity | High | 🟡 | Need the actual tier thresholds/prices for a specific test SKU. |

### Categories
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-020 | Create/edit category | High | 🟢 | |
| ADM-021 | Assign product to category | High | 🟢 | |
| ADM-022 | Category URL rewrite and breadcrumbs | High | 🟢 | |

### Merchandising
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-023 | IN STOCK badge | High | 🟡 | Need the exact rule (which attribute/config drives it) to assert correctly rather than just "a badge exists." |
| ADM-024 | NEW badge | High | 🟡 | Need the "new" window definition (date range logic). |
| ADM-025 | PRE-ORDER badge and availability | Critical | 🟡 | Need expected date/label format and add-to-cart-while-pre-order business rule. |
| ADM-026 | Sale and bestseller badges | Medium | 🟡 | Need the source fields/rules driving each badge. |

### Inventory
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-029 | GA and CA source inventory | Critical | 🟡 | Need a defined test SKU with known source quantities per warehouse. |
| ADM-030 | Pre-order with zero source quantity | Critical | 🟢 | |

### Customers
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-031 | Create customer | High | 🟢 | |
| ADM-032 | Customer group assignment | High | 🟢 | |
| ADM-033 | Login as Customer | High | 🟢 | |
| ADM-034 | Customer address save | High | 🟢 | |
| ADM-035 | Customer password reset | Medium | 🟢 | Overlaps with storefront REG-018/019 (§3) — consider one shared implementation covering both Admin-initiated and self-service reset if the flows share logic. |

### Avalara
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-036 | Tax certificate link and page | High | 🟢 | |
| ADM-037 | Add exemption certificate | High | 🟢 | Needs an "approved test certificate" file/data fixture. |
| ADM-038 | Valid exemption excludes tax | Critical | 🟢 | |
| ADM-039 | No certificate includes tax | Critical | 🟢 | |

### Fortis
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-040 | First-order card form | Critical | 🟢 | Not started manually yet either — good candidate to build alongside first manual execution. |
| ADM-041 | Place order with new card | Critical | 🟢 | Needs Fortis sandbox test card. |
| ADM-042 | Saved card selection | High | 🟢 | Needs a customer with a pre-saved card fixture. |
| ADM-043 | Declined card handling | High | 🟢 | Needs a guaranteed-decline Fortis sandbox card. |

### Klevu
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-044 | Quick search suggestions | Critical | 🟡 | Tracker gives an example term ("Kendall") but no expected suggestion list — need expected output to assert against. |
| ADM-045 | Product suggestions and image URLs | High | 🟡 | Same — need expected product set for a given search term. |
| ADM-046 | No-result and repeat search | High | 🟡 | Need a confirmed "unknown term" that reliably returns zero results. |

### Orders
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-047 | Create order through storefront | Critical | 🟢 | |
| ADM-048 | Admin order view | High | 🟢 | |
| ADM-049 | Invoice creation | High | 🟢 | |
| ADM-050 | Shipment and tracking | Medium | 🟢 | |
| ADM-051 | Credit memo / refund visibility | Medium | 🟢 | |

### Shipping
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-052 | Ship Now method | High | 🟢 | |
| ADM-053 | Future shipment date | High | 🟢 | |
| ADM-054 | Warehouse Pickup | High | 🟢 | |
| ADM-055 | Percent Shipping rules | High | 🟢 | See fully specified PS- series in §5 — this Admin-side case and the storefront PS-001–010 cases likely share the same underlying rule engine. |

### Integrations
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-056 | Boomi customer sync | Critical | 🔴 | API/log-level check against NetSuite or the sync log — not a UI test. See design doc §9. |
| ADM-057 | Boomi order sync | Critical | 🔴 | Same. |
| ADM-058 | Boomi inventory sync | Critical | 🔴 | Same. |
| ADM-059 | CSV order/invoice import | High | 🟡 | Need the "approved CSV fixture" file and expected imported/skipped counts. |

### Operations
| ID | Title | Priority | Readiness | Notes |
|---|---|---|---|---|
| ADM-060 | Cron schedule and execution | Critical | 🔴 | Requires server access — out of browser-automation scope. |
| ADM-061 | Queue and message consumers | High | 🔴 | Same. |
| ADM-062 | System and exception logs | High | 🔴 | Same. |
| ADM-063 | Transactional email | Medium | 🟡 | UI-triggerable, but needs a test-inbox strategy (e.g., Mailtrap/similar) to assert content, not just "an email sends." |
| ADM-064 | Admin reports and dashboards | Medium | 🟢 | "Loads without fatal errors" is directly automatable as a smoke check. |
| ADM-065 | Backup / rollback evidence | Critical | 🔴 | Documentation/process verification, not a UI test. |

---

## 3. Storefront (P5 Plan) — Automation Candidates

### Registration and Login (`REG-`)

**Update:** REG-001 and REG-002 have since been received as fully detailed, step-by-step test cases (Test Case / Step # / Action / Expected Result), confirming the staging URL (`https://mcstaging.accentdecor.com`) and revealing that registration is a **three-step B2B wholesale application** (Account & Contact Info incl. EIN/Company Name/Business Type/Years in Business → Billing Information → Shipping Information), not a simple email/password form as originally assumed. Design doc §6 updated accordingly. Both cases are now 🟢🟢 in the stronger sense — fully scriptable once staging credentials and the placeholder test data below are supplied, no clarification round needed.

**Still-placeholder data in the received cases** (needed before scripting, not a detail gap): approved test EIN, approved test company name, a unique-per-run test email, and "approved valid billing/shipping test data." These are tracked in design doc §8 and §15.

| ID | Title | Priority | Readiness |
|---|---|---|---|
| REG-001 | New customer registration, all valid fields | Medium | 🟢 — full steps received |
| REG-002 | Registration with missing required fields | Medium | 🟢 — full steps received |
| REG-003 | Registration with invalid email format | Medium | 🟢 |
| REG-004 | Registration with existing email | Medium | 🟢 |
| REG-005 | Password complexity/confirmation validation | Medium | 🟡 (need exact complexity rule) |
| REG-006 | Account created with expected status/group | Medium | 🟢 |
| REG-007 | Registration/welcome emails, if enabled | Medium | 🟡 (need test-inbox strategy) |
| REG-008 | Login valid credentials, each customer group | Medium | 🟢 |
| REG-009 | Invalid login — wrong password | Medium | 🟢 |
| REG-010 | Invalid login — unknown email | Medium | 🟢 |
| REG-011 | Logout from dashboard | Medium | 🟢 |
| REG-012 | Logout from cart/checkout | Medium | 🟢 |
| REG-013 | Protected pages redirect after logout | Medium | 🟢 |
| REG-014 | Forgotten password — valid email | Medium | 🟡 (test-inbox) |
| REG-015 | Forgotten password — unknown email (no enumeration) | Medium | 🟢 |
| REG-016 | Reset-password email link opens correctly | Medium | 🟡 (test-inbox) |
| REG-017 | Password reset — valid new password | Medium | 🟢 |
| REG-018 | Expired/reused/invalid reset links rejected | Medium | 🟡 (need a way to generate an expired/used link on demand) |
| REG-019 | Login succeeds with new password | Medium | 🟢 |
| REG-020 | Customer dashboard shows correct account info | Medium | 🟢 |
| REG-021 | Address book CRUD + default billing/shipping | Medium | 🟢 |
| REG-022 | Order history shows only own orders | Medium | 🟢 |
| REG-023 | Saved payment methods display; add new card via Fortis | Medium | 🟢 |
| REG-024 | Login As Customer preserves group pricing | Medium | 🟢 |

**Good first migration target** — flagged in the design doc for exactly this reason: fully passing, mostly 🟢, no third-party integration dependency except email (which can be deferred/stubbed initially).

### Product Catalog (`CAT-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| CAT-001 | PLP Klevu integration | Medium | 🟡 — currently **In Progress** per the tracker (only item not fully passing in this section); confirm current state before automating, may be chasing a moving target. |
| CAT-002 | PLP prices by customer group | Medium | 🟡 (need expected price per group for a test SKU) |
| CAT-003 | PLP labels (Sale/New/InStock/PreOrder/BestSeller) by group | Medium | 🟡 (need source rule per label) |
| CAT-004 | PDP prices by customer group | Medium | 🟡 (same as CAT-002) |
| CAT-005 | PDP minimum quantity increments by group | Medium | 🟡 (need expected increments) |
| CAT-006 | Product availability displays on PDP | Medium | 🟢 |
| CAT-007 | Color/shape selection on PDP | Medium | 🟡 (need test product + expected variant matrix) |
| CAT-008 | Products in correct categories w/ accurate price/desc/attributes | Medium | 🟡 (broad — needs a bounded test product set) |
| CAT-009 | Product filtering and sorting | Medium | 🟡 (need expected filter/sort behavior spec) |
| CAT-010 | Search functionality and keyword relevance | Medium | 🟡 (need expected result set for defined query — "relevance" isn't directly assertable without one) |

### Shopping Cart (`CART-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| CART-001 | Add to cart from PLP and PDP | Medium | 🟢 |
| CART-002 | Remove from cart | Medium | 🟢 |
| CART-003 | Update quantities | Medium | 🟢 |
| CART-004 | Price updates, tier prices, discounts, totals | Medium | 🟡 (need expected values for a defined scenario) |
| CART-005 | Cart validation (min qty, stock, unavailable) | Medium | 🟡 (need the specific rules/messages expected) |
| CART-006 | Proceed to checkout | Medium | 🟢 |

### Mini Cart (`MC-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| MC-001 | Item count, names, prices, qty display | Medium | 🟢 |
| MC-002 | Remove from mini cart | Medium | 🟢 |
| MC-003 | Update qty in mini cart | Medium | 🟢 |
| MC-004 | Mini cart totals match full cart | Medium | 🟢 |
| MC-005 | View/Edit Cart link | Medium | 🟢 |
| MC-006 | Persists across login/logout/refresh | Medium | 🟢 |

### Checkout Process (`CHK-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| CHK-001 | Complete checkout, cart through order placement | Medium | 🟢 |
| CHK-002 | All applicable payment methods | Medium | 🟡 (need the full expected method list) |
| CHK-003 | All applicable shipping methods | Medium | 🟡 (need the full expected method list) |
| CHK-004 | Order summary — taxes, discounts, promotions, totals | Medium | 🟡 (need a defined scenario with expected numbers) |

### Order Minimum (`MIN-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| MIN-001 | Drop Ship, order over $150 | Medium | 🟢 |
| MIN-002 | Drop Ship + Replacement type, order under $150 allowed | Medium | 🟢 |
| MIN-003 | Drop Ship, order under $150 blocked (no exception) | Medium | 🟢 |
| MIN-004 | US price level, order under $150 blocked | Medium | 🟢 |
| MIN-005 | US price level, order over $150 allowed | Medium | 🟢 |

All fully specified — this is a well-defined, deterministic threshold rule. Good early automation target alongside Registration/Login.

### Drop Ship Program — Opted In / Not Opted In (`DS-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| DS-001…011 | Full login → browse → PDP → cart → mini cart → checkout → payment → order-placement flow, opted-in | Medium | 🟢 |
| DS-012…022 | Same flow, not-opted-in | Medium | 🟢 |

These are effectively one parameterized end-to-end flow run twice (opted-in vs. not) — recommend implementing as a single Playwright test with the customer-group fixture as a parameter rather than 22 separate specs.

### Avalara (storefront) (`AVA-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| AVA-001 | Tax certificate link visible in dashboard | Medium | 🟢 |
| AVA-002 | AvaTax Certificates page displays correctly incl. Add Exception button | Medium | 🟢 |
| AVA-003 | Add exemption certificate from Certificates page | Medium | 🟢 |
| AVA-004 | Certificate pages match approved Figma design | Medium | 🔴 — visual/design QA, not a functional assertion; candidate for visual regression tooling later, not standard Playwright assertions. |
| AVA-005 | Checkout excludes tax with valid certificate | Medium | 🟢 |
| AVA-006 | Checkout includes tax without certificate | Medium | 🟢 |
| AVA-007 | Checkout shows add-exception link without certificate | Medium | 🟢 |
| AVA-008 | Add new certificate mid-checkout | Medium | 🟢 |

### Fortis Payment (storefront) (`FOR-`)
| ID | Title | Priority | Readiness |
|---|---|---|---|
| FOR-001 | First-time customer sees new-card form + Place Order available | Medium | 🟢 |
| FOR-002 | First-time customer places order with new card | Medium | 🟢 |
| FOR-003 | Returning customer sees saved-card + new-card layouts | Medium | 🟢 |
| FOR-004 | Returning customer places order with new card | Medium | 🟢 — tracker notes a prior error is now resolved; good regression-lock candidate. |
| FOR-005 | Returning customer places order with saved card | Medium | 🟢 — same note as FOR-004. |

### Shipping Options — Detailed QA (`AP-`)
Already ID'd and fully detailed in the source plan. See §5 for full specs — all 🟢 except AP-007.

| ID | Title | Priority | Readiness |
|---|---|---|---|
| AP-001 | Shipping Options feature configuration | High | 🟢 |
| AP-002 | LTL and Small Parcel accessorial option prices | High | 🟢 |
| AP-003 | Accessorial options and totals in cart | High | 🟢 |
| AP-004 | LTL accessorial options during checkout | High | 🟢 |
| AP-005 | Small Parcel accessorial options during checkout | High | 🟢 |
| AP-006 | Accessorial selections persist and can be changed | High | 🟢 |
| AP-007 | Accessorial options transmitted/mapped in NetSuite | High | 🔴 | API/NetSuite-side check, not UI. |

### Delivery Method — Percent Shipping (`PS-`)
Already ID'd and fully detailed in the source plan, including exact tier percentages and thresholds. See §5 for full specs — all 🟢 except PS-010 needs a policy answer.

| ID | Title | Priority | Readiness |
|---|---|---|---|
| PS-001 | Percent Shipping carrier configuration and storefront availability | High | 🟢 |
| PS-002 | Available only for valid US/Canadian addresses | High | 🟢 |
| PS-003 | US tiers and boundary values (physical subtotal) | High | 🟢 |
| PS-004 | Canadian tiers and boundary values | High | 🟢 |
| PS-005 | AK/HI/PR exception | High | 🟢 |
| PS-006 | Drop Ship Third Party Billing rule | High | 🟢 |
| PS-007 | Third Party Billing tooltip and presentation | High | 🟡 — tooltip *text* assertion is fine; visual presentation isn't. |
| PS-008 | Totals persist from Shipping step through order placement | High | 🟢 |
| PS-009 | Delivery-date attributes when Percent Shipping selected | High | 🟢 |
| PS-010 | US territories not explicitly coded as exceptions (Guam, USVI) | High | 🟡 — tracker itself flags this as needing a business-rule confirmation ("create a defect if behavior doesn't match requirements"); we need that requirement stated before we can assert a pass/fail. |

---

## 4. Summary — Readiness at a Glance

| Rating | Approx. count | What's needed |
|---|---|---|
| 🟢 Ready | ~100 of ~135 | Staging access + selector discovery only (see §6) |
| 🟡 Needs detail | ~30 | A short round of clarifying questions to QA/business (listed inline above) before the assertion can be made deterministic |
| 🔴 Not UI-automatable | ~10 | API/server-level tooling, visual regression tooling, or stays manual |

The 🟢 set alone — roughly 100 cases — is enough to build a substantial first version of the suite without blocking on anything but environment access.

---

## 5. Fully Specified Examples (Ready to Implement)

These illustrate the level of detail the rest of the 🟢 cases will get during actual test authoring. Two representative examples:

### PS-003 — Verify US Percent Shipping tiers and boundary values
- **Priority:** High
- **Preconditions:** Logged-in or guest customer with a US lower-48 shipping address; cart seeded to a known physical-subtotal value (pre-discount).
- **Test data:** Tier table (confirm active config matches): $0–$1,499 = 25%, $1,500–$2,999 = 17%, $3,000–$5,999 = 14%, $6,000+ = 10%.
- **Steps:**
  1. Seed a cart at each tier boundary (e.g., $1,499, $1,500, $2,999, $3,000, $5,999, $6,000) using **physical** subtotal.
  2. Apply a discount to one scenario to confirm the calculation still uses physical value, not discounted subtotal.
  3. Proceed to the Shipping step.
- **Expected assertions:**
  - Displayed tier label/message matches the tier the subtotal falls into.
  - Displayed rate equals `physical_subtotal × tier_percentage / 100`.
  - Discounted-cart scenario still calculates off physical subtotal, not the discounted total.
- **Tags:** `@high @shipping @percent-shipping @regression`

### MIN-001 — Drop Ship customer, order over $150
- **Priority:** Medium
- **Preconditions:** Authenticated customer with Drop Ship price level and group.
- **Test data:** Cart total > $150 using seeded test SKUs.
- **Steps:**
  1. Log in as Drop Ship test account (fixture).
  2. Add product(s) totaling more than $150.
  3. Proceed through checkout to order placement.
- **Expected assertions:**
  - No minimum-order blocking message appears.
  - Order places successfully and confirmation page shows a generated order ID.
- **Tags:** `@medium @order-minimum @drop-ship @regression`

Every other 🟢 case in §2/§3 follows this same shape once we're ready to author — title, priority, preconditions, test data, numbered steps, and explicit assertions — pulled from the tracker's existing "Steps" and "Expected result" columns wherever detailed enough, or from a clarifying answer where flagged 🟡.

---

## 6. What's Needed Before Any of This Runs

Regardless of readiness rating, every case needs:

1. **Staging environment URL and credentials** — Admin test account, and one test account per customer group (COT, US, Drop Ship).
2. **Selector discovery** — running `playwright codegen` against real staging pages to capture actual locators; nothing in the source trackers specifies DOM structure.
3. **Fortis sandbox credentials/test cards** (including a guaranteed-decline card).
4. **Avalara test certificate(s)** — one valid, one expired/invalid.
5. **A defined set of test SKUs** — simple, configurable (with known variants), pre-order/zero-quantity, and one at/near the Small Parcel shipping threshold.
6. **A test-inbox strategy** for the several 🟡 cases that assert on email content/links.

## 7. Next Steps

1. Confirm working IDs (`REG-`, `CAT-`, etc.) or get the team's preferred convention for the storefront cases that don't have official IDs yet.
2. Resolve the 🟡 "needs detail" items — batch these into one round of questions to QA/business rather than blocking case-by-case.
3. ~~Get staging access~~ Staging URL confirmed (`https://mcstaging.accentdecor.com`) via REG-001/REG-002; still need actual login credentials (Admin + one per customer group) before running anything, including the connection smoke check already scaffolded.
4. Run `playwright codegen` against staging to start capturing real selectors, once credentials are available.
5. Begin implementation with the three cross-referenced "good first target" clusters: **Registration (REG-)**, **Order Minimums (MIN-)**, and **Percent Shipping (PS-)** — Registration now has full step-by-step detail in hand; supply the remaining placeholder test data (EIN, company name, billing/shipping data) before scripting it.
