# QA Automation System — Design Doc (Playwright)
## Accent Decor — Magento 2.4.8 Admin + Storefront

**Status:** Draft — foundation/setup phase
**Audience:** Engineering team (SWE background, new to QA automation and Playwright)
**Scope:** Environment, tooling, repo structure, and conventions, informed by the existing manual QA trackers (Admin QA Tracker, P5 security patch staging plan). Actual test cases and detailed test documentation are a follow-up deliverable.
**Language:** TypeScript is the working assumption throughout this doc — **pending confirmation**. See §4 for what changes if that's revised.

---

## 1. Purpose and Goals

We're standing up an end-to-end (E2E) QA automation system using Playwright to cover Accent Decor's Magento 2.4.8 site — both the Admin panel and the storefront. This doc defines the foundation — how the project is set up, how a new engineer gets running locally, and the conventions we'll follow — so that once approved, writing actual tests is "clone repo, run one command."

This effort is grounded in two existing manual QA artifacts already in use by the team:
- **Admin QA Tracker** — 65 test cases across 15 functional areas (Admin Access, Configuration, Cache/Index, Catalog, Categories, Merchandising, Inventory, Customers, Avalara, Fortis, Klevu, Orders, Shipping, Integrations, Operations), run against the New Production Admin panel, with a Go/No-Go rule of zero open Critical/High defects.
- **P5 Security Patch QA Plan** — storefront regression plan run on staging after the 2.4.8-p5 patch deploy, covering registration/login, catalog, cart, mini cart, checkout, order minimums, Drop Ship program (opted-in and not opted-in), Avalara, Fortis, and a detailed shipping suite (Percent Shipping tiers, LTL/Small Parcel accessorial options).

The automation system should eventually absorb the *repeatable* parts of both trackers — regression-prone flows that get re-run on every patch/release — while manual QA continues to own true exploratory testing and one-off patch verification.

**Goals:**
- A repeatable, version-controlled test framework any engineer can run locally and in CI with minimal setup friction.
- Test organization that mirrors the functional areas already established in the manual trackers, so coverage gaps and overlaps are easy to spot and so this isn't "yet another system to reconcile" for the QA team.
- Traceability conventions compatible with the existing tracker (ID prefixes, priority levels, defect linking) so automated results can sit alongside manual results without translation.
- A foundation that absorbs performance benchmarking — page-load/Core Web Vitals via Playwright, and concurrent-user load testing via k6 — without a second, disconnected toolchain. See §13.

**Non-goals (for this doc):**
- Actual test case authoring/migration from the trackers into Playwright specs.
- Detailed CI pipeline YAML (we'll outline the shape, not the final config).
- Replacing manual QA — Admin operational checks (cron, queues, log review, backup verification) and true exploratory testing stay manual; automation targets the deterministic, repeatable flows.
- Writing actual k6 load scenarios — §13 defines the approach and repo placement; scripting specific scenarios (e.g., checkout under load) is follow-up work once the core E2E suite is stable.

---

## 2. Background — Why Playwright

We evaluated Playwright vs Cypress vs Selenium. Summary of the decision:

- **Playwright** runs out-of-process and talks to the browser via CDP/dedicated protocols, giving multi-tab/multi-origin support, native cross-browser coverage (Chromium, Firefox, WebKit), and generally faster/more reliable CI runs than the alternatives.
- Multi-language support (JS/TS, Python, Java, C#) matters less here since we're standardizing on one language (see §4), but it's a hedge if the language decision changes.
- Strong built-in tracing/video/network capture is a direct win for this project specifically: the manual trackers require an evidence link for every Pass/Fail (screenshot, ID, log, or link). Playwright's trace viewer and automatic screenshot/video-on-failure give us that evidence model for free, in a format we can attach to CI runs or link from defect tickets the same way the trackers link Wrike evidence today.
- Cypress remains a fine tool, but Playwright's out-of-process architecture handles Magento's multi-domain aspects better (Admin and storefront are effectively separate origins in some environments; Fortis and Avalara flows can involve hosted fields/iframes).

---

## 3. Core Concepts (if you're new to QA automation)

You know how to write software; here's the vocabulary specific to this domain so the rest of the doc makes sense.

| Concept | What it means |
|---|---|
| **E2E test** | A test that drives a real (or real-ish) browser through a user flow — click, type, navigate — and asserts on the resulting UI/state. Different from a unit test: it exercises the whole stack. |
| **Locator** | Playwright's abstraction for "find this element." Locators are lazy and auto-retry — they don't resolve to a DOM node until an action is performed, which is why Playwright tests are less flaky than older tools that grab an element once and act on a stale reference. |
| **Auto-waiting** | Playwright automatically waits for an element to be visible, stable, and actionable before interacting with it. You generally don't write manual `sleep()`/`wait()` calls — if you find yourself doing that, it's a smell. |
| **Fixture** | A reusable setup/teardown unit (e.g., "a logged-in Admin session," "an authenticated Drop Ship customer," "a seeded product") that tests can request as a parameter, similar to pytest fixtures or DI in a test context. |
| **Page Object Model (POM)** | A design pattern where each page/component of the app under test gets a class encapsulating its locators and actions (e.g., `AdminLoginPage.login(user, pass)`, `CheckoutPage.selectShippingMethod(name)`). Keeps tests readable and centralizes selector maintenance — important on a Magento site where markup can be theme/module-heavy. |
| **Test runner / test project** | Playwright Test (`@playwright/test`) is both the assertion library and the runner. A "project" in Playwright config is a named test configuration (e.g., run this suite against Chromium desktop, or against a specific customer-group storage state). |
| **Trace / trace viewer** | A recorded timeline (DOM snapshots, network, console, screenshots) of a test run you can step through visually after the fact — our primary flaky-test debugging tool, and our evidence artifact. |
| **Flakiness** | A test that passes/fails inconsistently without a code change. Usually caused by races, unhandled async waits, or shared/mutating test state — a real risk here given how many flows depend on shared customer accounts and inventory state. |

---

## 4. Language and Tooling Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** — *pending confirmation* | Type safety on selectors/fixtures/page objects catches mistakes at compile time; best-supported language for Playwright tooling (codegen, VS Code extension). **If this changes:** Playwright also supports Python, Java, and C#. Python is the most likely alternative if the team leans that way for other tooling (e.g., data seeding scripts, Boomi/NetSuite verification scripts) — the repo structure in §6 and concepts in §3 hold either way; only §5 (setup commands) and linting/formatting tooling would need updating. |
| Test runner | **`@playwright/test`** (not raw `playwright` library, not Jest/Mocha bolted on) | Purpose-built for this, includes parallelization, retries, fixtures, and reporting out of the box. |
| Package manager | **pnpm** (fallback: npm if the team has an existing org standard) | Faster installs, disk-efficient, good CI caching. |
| Node version manager | **nvm** (or Volta) | Pins Node version per-repo so "works on my machine" issues don't creep in. |
| Formatting/linting | **ESLint + Prettier**, Playwright's recommended ESLint config | Keep test code held to the same bar as production code. |
| Browsers under test | Chromium primarily; Firefox/WebKit as secondary projects | The manual trackers don't call out specific browsers, implying Chromium is the de facto target today. Recommend starting Chromium-only for speed, then adding Firefox/WebKit projects once the core suite is stable — cheap to add later, not worth the CI time cost up front. |
| Load/performance testing | **k6** (open-source binary, JS/TS scripting, plus the k6 browser module for real-browser metrics under load) | Same scripting language as the E2E suite, runs in the same CI, and reuses the same user-flow definitions (login → PLP → PDP → cart → checkout) already mapped for Playwright. See §13. |

**Cost note:** every tool in this table is free — Playwright is Apache 2.0 with no feature gate at any scale, and the k6 CLI is free/open-source (AGPL) with unlimited local virtual users. The only costs anywhere in this stack are your own CI compute (which you'd pay for regardless of testing tool) and *optional* managed cloud execution services (Microsoft's Azure Playwright Testing, Grafana k6 Cloud) that scale beyond your own CI runners — neither is part of the current plan, and nothing here requires them to work.

---

## 5. Environment Setup (from a clean machine)

### 5.1 Prerequisites
1. **Git** — assume already installed.
2. **Node.js** (LTS — pin via `.nvmrc` once repo exists; targeting Node 20.x+):
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install --lts
   nvm use --lts
   ```
3. **pnpm**:
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
4. **VS Code** (recommended) with the **Playwright Test for VS Code** extension.

### 5.2 Clone and install
```bash
git clone <repo-url> qa-automation
cd qa-automation
pnpm install
```

### 5.3 Install Playwright's browser binaries
```bash
pnpm exec playwright install --with-deps
```

### 5.4 Run the sample test suite
```bash
pnpm exec playwright test
```
UI mode (recommended while learning):
```bash
pnpm exec playwright test --ui
```

### 5.5 Environment variables / secrets
- Local: `.env.local` (gitignored), loaded via `dotenv` in `playwright.config.ts`.
- CI: injected as pipeline secrets, never committed.
- `.env.example` in the repo documents required keys with placeholder values.
- **Specific to this project:** test account credentials (Admin controlled accounts, customer-group test emails), Fortis sandbox keys, and Avalara test-certificate references must never be hardcoded in test files — all pulled from env config, matching how the manual trackers already isolate "controlled"/"approved test" accounts from real data.

---

## 6. Repository Structure

Structured to mirror the functional areas already established in the Admin QA Tracker and the P5 storefront plan, so coverage can be tracked area-by-area against both.

**Note:** this repo contains only test-automation code — Page Objects, fixtures, and helpers that drive the Magento site from the outside via browser automation and API calls. It does not, and should not, contain any of Accent Decor's actual application/site source code.

```
qa-automation/
├── .github/workflows/
├── framework/                      # test-framework code only — not the site's application code
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── admin-login.page.ts
│   │   │   ├── configuration.page.ts
│   │   │   ├── cache-index.page.ts
│   │   │   ├── catalog.page.ts
│   │   │   ├── categories.page.ts
│   │   │   ├── customers.page.ts
│   │   │   ├── orders.page.ts
│   │   │   └── shipping.page.ts
│   │   └── storefront/
│   │       ├── registration/
│   │       │   ├── account-info.page.ts   # Step 1 — incl. EIN, Company Name, Business Type, Years in Business
│   │       │   ├── billing-info.page.ts   # Step 2
│   │       │   └── shipping-info.page.ts  # Step 3
│   │       ├── login.page.ts
│   │       ├── plp.page.ts
│   │       ├── pdp.page.ts
│   │       ├── cart.page.ts
│   │       ├── mini-cart.page.ts
│   │       └── checkout.page.ts
│   ├── components/                 # Shared widgets: header nav, mini-cart drawer, tax-certificate modal, etc.
│   ├── fixtures/
│   │   ├── auth.fixture.ts         # Admin login, customer login per group (COT / US / Drop Ship)
│   │   ├── cart.fixture.ts         # Seeded cart states
│   │   └── payment.fixture.ts      # Fortis sandbox card helpers
│   └── utils/
│       ├── test-data.ts            # Test account registry, SKUs, addresses
│       └── api-clients/            # Direct Magento REST/GraphQL calls for setup/teardown (faster than UI seeding)
├── tests/
│   ├── smoke/                      # Fast critical-path checks — every PR (login, PDP add-to-cart, checkout happy path)
│   ├── admin/
│   │   ├── admin-access/           # ADM-001–006 equivalents
│   │   ├── configuration/          # ADM-007–011
│   │   ├── cache-index/            # ADM-012–014
│   │   ├── catalog/                # ADM-015–019, 027–028
│   │   ├── categories/             # ADM-020–022
│   │   ├── merchandising/          # ADM-023–026
│   │   ├── inventory/              # ADM-029–030
│   │   ├── customers/              # ADM-031–035
│   │   ├── orders/                 # ADM-047–051
│   │   ├── shipping/               # ADM-052–055
│   │   └── operations/             # ADM-060–065 — largely manual/server-access; automate what's UI-reachable
│   ├── storefront/
│   │   ├── registration-login/
│   │   ├── product-catalog/        # PLP/PDP, Klevu search
│   │   ├── cart/
│   │   ├── mini-cart/
│   │   ├── checkout/
│   │   ├── order-minimums/         # $150 threshold rules by customer group
│   │   └── drop-ship-program/      # opted-in / not-opted-in flows
│   ├── integrations/
│   │   ├── avalara/                # tax certificates, exemption logic
│   │   ├── fortis/                 # payment: new card, saved card, declines
│   │   ├── klevu/                  # search suggestions, product results
│   │   └── boomi-netsuite/         # customer/order/inventory sync — likely API-level, not UI
│   └── shipping-rules/
│       ├── percent-shipping/       # PS-001–010 — tiered % shipping, regional exceptions
│       └── accessorial/            # AP-001–007 — LTL/Small Parcel accessorial options
├── performance/                    # Playwright-based perf checks — see §13
│   ├── web-vitals/                 # Per-flow CDP/Core Web Vitals regression checks (PDP, checkout, PLP+Klevu)
│   └── lighthouse/                 # Lighthouse-via-CDP audits for key pages
├── k6/                             # Separate runner, same repo — see §13
│   ├── scenarios/
│   │   ├── checkout-load.js        # Highest priority — cart/payment/tax/shipping intersection under load
│   │   ├── plp-search-load.js      # PLP + Klevu search under concurrent load
│   │   └── pdp-browse-load.js
│   └── config/                     # Base URL, VU/duration presets per environment
├── test-results/                   # Gitignored — traces, screenshots, videos
├── playwright-report/              # Gitignored — HTML report output
├── playwright.config.ts
├── environments.ts                 # Base URLs per environment (see §7)
├── .env.example
├── .nvmrc
├── package.json
├── tsconfig.json
└── README.md
```

**Conventions:**
- One page object per logical page/feature; tests import from `framework/pages`, never hardcode selectors inline.
- Prefer Playwright's built-in locators (`getByRole`, `getByLabel`, `getByTestId`) over CSS/XPath — more resilient to Magento theme/module markup changes.
- **Keep the original test IDs as a comment or annotation** on the corresponding Playwright test (e.g., `// Covers ADM-015`, `// Covers PS-003`) so anyone cross-referencing the trackers can find the automated equivalent instantly. This is the cheapest way to keep the two systems in sync without building tooling for it.
- Tests must be independent and order-agnostic. Prefer API-level setup/teardown (`framework/utils/api-clients`) over UI steps for seeding — faster and less flaky, especially for anything touching inventory or customer accounts that multiple tests might share.
- Tag tests (`@smoke`, `@regression`, `@patch-verification`) via Playwright annotations so CI can run subsets — `@patch-verification` in particular maps to the kind of post-deploy regression the P5 plan represents, so a patch release can trigger just that tagged subset.

**Correction from the original assumption:** registration is not a single login/email/password form — the detailed REG-001/REG-002 test cases (received after this doc's first draft) show it's a **three-step B2B wholesale application**: Account & Contact Info (including Federal Tax ID/EIN, Company Name, Business Type, Years in Business) → Billing Information → Shipping Information → submit. The page-object split above reflects that; treat `registration-login/` in the test-case-spec doc's `REG-` cluster as covering all three steps, not one form.

---

## 7. Configuration (`playwright.config.ts`) and Environments

Key things this file defines:
- **`projects`** — browser targets (see §4) plus, if needed, projects per customer-group storage state (COT / US / Drop Ship) so authenticated storefront tests don't each need to log in from scratch.
- **`baseURL`** — driven by `TEST_ENV`, resolved via `environments.ts`.
- **`retries`** — 1–2 in CI (0 locally).
- **`reporter`** — HTML locally; HTML + JUnit (or similar) in CI.
- **`use.trace`** — `on-first-retry`, giving us the same evidence-per-failure model the manual trackers use, without paying overhead on green runs.

**Environments to support**, based on the two source documents:
- `staging` — confirmed at `https://mcstaging.accentdecor.com` (via the REG-001/REG-002 test cases) — where the P5 patch plan ran, post-deploy regression target, and where all mutating tests (registration, orders, customer creation) should run by default.
- `production-readonly` (or however we scope safe production checks) — mirrors what the Admin QA Tracker calls "New Production," used for read-mostly/config-verification checks only; anything mutating should default to staging unless there's an explicit, controlled reason to run against production, matching the "controlled test account" discipline already used manually. URL still needs confirming (see §15).

```bash
TEST_ENV=staging pnpm exec playwright test
```

---

## 8. Test Data and Authentication Strategy

The trackers already establish a data discipline worth carrying into automation exactly as-is:

- **Admin accounts:** dedicated, controlled Admin test users — never personal or production-admin credentials in test code.
- **Customer accounts by group:** COT, US, and Drop Ship price-level test accounts (the trackers use a consistent `+alias@` email convention for these — worth continuing so test inboxes stay identifiable and filterable). Each group needs its own Playwright fixture/storage-state so group-specific pricing, minimum-order-amount rules ($150 threshold), and shipping eligibility ( Drop Ship Third Party Billing vs standard tiers) can be tested without re-authenticating per test.
- **Payment:** Fortis sandbox/test cards for new-card and saved-card flows, plus at least one guaranteed-decline test card (per ADM-043 / the Fortis section of the P5 plan).
- **Tax:** Avalara test exemption certificates — both a valid and an expired/invalid one, to cover the "excludes tax" / "includes tax" pair of scenarios.
- **Products/inventory:** a small set of dedicated test SKUs — a simple product, a configurable product with known variants, a pre-order SKU with zero source quantity, and one at/above vs below the Small Parcel shipping threshold — seeded via API rather than relying on live catalog data that can change.
- **Registration/wholesale application fields:** an approved test EIN, test company name, and approved valid billing/shipping test data, per the REG-001/REG-002 cases — these are still placeholders in the received test cases and need concrete values before that flow can be scripted end-to-end.

This should live in `framework/utils/test-data.ts` as a single source of truth, with real values loaded from environment config rather than committed to the repo.

---

## 9. Third-Party Integration Testing Strategy

Several areas in the trackers are integration-heavy and need a specific approach rather than being treated as generic UI flows:

- **Fortis (payment):** UI-level E2E for the checkout experience (form rendering, saved vs new card), against Fortis's sandbox. Keep these in `tests/integrations/fortis/`.
- **Avalara (tax):** UI-level for certificate management and checkout tax behavior; straightforward to automate since it's deterministic given a known certificate state.
- **Klevu (search):** UI-level for suggestion rendering and result correctness, but be aware search relevance/indexing can lag — these tests should tolerate eventual consistency (poll/retry on the assertion, not a hard-coded wait) rather than assuming instant index updates.
- **Boomi → NetSuite sync:** This is the one area where pure UI automation is the wrong tool. The manual tracker already treats sync verification as "place order/create customer, then inspect the integration result" — that's better suited to an **API-level check** (query NetSuite or the sync log via API after triggering the Magento-side action) than driving a UI to look at logs. Flag this as a candidate for a lightweight API test layer alongside the Playwright UI suite, not necessarily inside Playwright itself.
- **Percent Shipping / Amasty Extra Fee (accessorial):** These are rule-engine-style calculations (tiered percentages, regional exceptions, threshold boundaries) currently verified by walking the UI through many boundary values. These are excellent candidates for **both** a UI-level smoke check (does the right option and price show up at checkout) **and** a faster, more exhaustive API or unit-level test against the calculation logic itself if we have access to the source (Magento module) — the UI suite shouldn't be the only place tier-boundary math gets validated.

---

## 10. Evidence, Reporting, and Traceability

To keep automated results legible alongside the existing manual process (which requires an evidence link and, on failure, a defect ID per the tracker's decision rules):

- Every CI run publishes the Playwright HTML report and traces-on-failure as build artifacts with a durable link (equivalent to the tracker's "Evidence link / reference" column).
- Failed tests should be linkable from whatever ticketing system defects already live in (Wrike, per the current trackers), using the same Defect ID convention (`Related test ID`, `Severity`, `Status`, `Retest result`) so a failing automated test can drop straight into the existing defect workflow rather than creating a parallel one.
- Priority levels carry over directly: **Critical** (blocks core commerce/admin operation — login, price, inventory, tax, payment, order, integration), **High**, **Medium**, **Low** — same definitions as the Reference Data sheet in the Admin QA Tracker. Use these as Playwright tags (`@critical`, `@high`, etc.) so CI can enforce the same Go/No-Go rule programmatically: **zero open Critical/High failures** blocks the pipeline.

---

## 11. CI/CD (outline — details in a follow-up)

- Trigger: on every PR (smoke suite) and on merge to main / nightly (full regression suite, tagged `@regression`).
- A dedicated `@patch-verification` run, triggerable on demand, covering the storefront regression scope from the P5-style plan — for validating future security patches without waiting on a full nightly cycle.
- Runs in a container with `playwright install --with-deps` cached between runs.
- Parallelization via Playwright's built-in sharding across CI runners.
- Artifacts (HTML report, traces for failed tests) uploaded on failure.

---

## 12. Execution Environments and Cost

Everything in this plan runs in two places, and both are free at the tooling level:

- **Local dev** — an engineer writes and runs tests on their own machine (`playwright test --ui`, `k6 run scenario.js`) against staging while building them. Normal dev workflow, no infra needed beyond the laptop.
- **CI** — the full suite runs in our existing CI (GitHub Actions, assumed — see §15 open questions) on every PR, merge, and nightly per §11. This is self-hosted/self-controlled infrastructure we already pay for as part of our CI plan, not a specialized paid testing cloud.

Playwright is Apache 2.0 licensed with no feature gate at any scale — no seat caps, no usage caps, cross-browser support and parallel execution are all included free regardless of suite size. The k6 CLI is free and open-source (AGPL) with unlimited local virtual users and the full browser-module feature set. Neither tool has a cost that scales with our test count.

**What would cost money** (not part of the current plan, flagged only so it's not a surprise later):
- **Microsoft Azure Playwright Testing** — a managed cloud grid for running Playwright suites on Microsoft-hosted browsers at massive parallelism, priced per test-minute. Only worth evaluating around the 1,000+ test / need-results-in-minutes scale — we're well below that.
- **Grafana k6 Cloud** — adds distributed multi-region load generation, hosted dashboards, and team collaboration on top of the same free k6 binary. Only relevant if we need to simulate load from multiple geographic regions simultaneously or want hosted result retention instead of CI artifacts.

Revisit both if/when suite size or load-testing ambition outgrows our own CI runners — nothing in the current design depends on either.

---

## 13. Performance Benchmarking

Performance splits into three different problems, each with a different tool, so we're deliberately not forcing one tool to do all three:

| Layer | Tool | Answers | Lives in |
|---|---|---|---|
| Per-flow regression (browser-level) | **Playwright + CDP / Lighthouse** | "Did this specific flow get slower after this change?" | `performance/` |
| Concurrent-user load | **k6** (+ browser module for real-browser metrics under load) | "How does it hold up under real traffic?" | `k6/` |
| Backend root-cause | **New Relic APM** (Magento PHP agent, already relevant to the stack) | "Why is it slow — DB, third-party API, PHP?" | N/A — existing New Relic setup |

### 13.1 Playwright — per-flow performance regression

Via a CDP session (Chromium only), Playwright can pull Core Web Vitals (LCP, CLS, INP, FCP, TTFB), long-task detection, and full network waterfalls from inside a normal test, and can throttle network/CPU to simulate slow-3G or low-end-device conditions. It can also host a Lighthouse audit against the same page it just navigated to, since both drive Chromium over the same CDP port.

Because single-run numbers are noisy, run each check 3–5 times and use the median, tracked as a trend over time rather than a hard pass/fail on one run. This is a regression check ("did this get slower"), not a load simulator — it only ever represents one user at a time.

**Priority targets** (highest traffic / most integration-heavy): PDP load time, PLP with Klevu search, checkout page render.

### 13.2 k6 — concurrent-user load testing

k6 fills the gap neither Playwright nor New Relic covers natively: simulating many users at once. New Relic's own scripted-browser Synthetics run on Selenium WebDriver, not Playwright, so it isn't a clean way to reuse our existing scripts — k6 is a better fit precisely because it shares Playwright's language (JS/TS) and CI pipeline without requiring a rewrite into a different tool's scripting model.

- **k6 browser module** drives real Chromium via CDP (same lineage as Playwright) and captures Core Web Vitals *while* simulating concurrent users — better for validating rendering holds up at moderate concurrency (tens of virtual users), not thousands; real browser instances are heavy to spin up in volume.
- **Protocol-level k6** (plain HTTP, no browser) is the tool for higher-concurrency numbers (hundreds/thousands of virtual users) hitting Magento's endpoints directly — faster and cheaper per virtual user, but blind to rendering/JS execution.
- Scenarios mirror the same user flows already mapped for the E2E suite (login → PLP → PDP → cart → checkout), so the flow-mapping work isn't duplicated, even though the k6 scripts themselves are written separately (there's no "run my Playwright spec under k6" shortcut).
- **Checkout is the highest-priority scenario** — it's the one place cart, payment, tax, and shipping calculation all intersect under load, and the one area where a regression directly costs revenue.
- **PCI note:** any k6 scenario touching Fortis must stay strictly within sandbox/test-card credentials — never point a load scenario at real card processing.
- Results (and Playwright's per-flow numbers) can optionally be pushed to New Relic as custom events via its Event API, tagged with build ID/commit, to get unified trend dashboards and alerting alongside existing backend APM data — without needing New Relic to run the browser itself.

### 13.3 Timing consideration for retail

If Accent Decor has seasonal/promotional traffic peaks, the highest-value k6 runs are done *before* peak season, at a realistic peak-multiplier concurrency — not just steady-state numbers.

---

## 14. Learning Resources (for engineers new to Playwright)

- Official docs: https://playwright.dev/docs/intro — read "Writing Tests" and "Locators" first.
- `playwright codegen <url>` — records clicks/inputs and generates test code; good for learning locator syntax, not for production test authoring.
- UI mode (`--ui`) — best way to build intuition for auto-waiting and the trace viewer.
- Playwright's "Best Practices" doc, particularly on avoiding hard waits and structuring independent tests — doubly important here given how much of this suite depends on shared customer-group and inventory state.

---

## 15. Open Questions / Decisions Needed Before Test Authoring Starts

- [ ] **Confirm language** (TypeScript vs alternative) — flagged as pending; revisit §4 once decided.
- [ ] Confirm package manager (pnpm vs matching an existing org standard).
- [ ] Confirm environment list and base URLs (**staging confirmed:** `https://mcstaging.accentdecor.com`; production-readonly scope/URL still needs explicit sign-off on what's safe to touch).
- [ ] Confirm CI provider (GitHub Actions assumed).
- [ ] Confirm whether Boomi/NetSuite verification should live in this repo (API-level tests) or a separate integration-testing repo/service.
- [ ] Confirm where automated defect results should link to — continue using Wrike, or migrate to something else alongside this new system.
- [ ] Confirm which Admin "Operations" checks (cron, queues, logs, backups) are realistically automatable vs staying manual/server-access-only.
- [ ] Confirm Fortis sandbox access/credentials for k6 load scenarios (separate from the Playwright E2E fixture credentials, if Fortis issues distinct sandbox keys per use case).
- [ ] Confirm whether/when to wire Playwright + k6 results into New Relic as custom events, and who owns the New Relic dashboard/alerting setup.
- [ ] Confirm concrete test data values for the registration flow: approved EIN, test company name, unique test email pattern, and approved billing/shipping test data (still placeholders in the received REG-001/REG-002 cases).
- [ ] Confirm Admin/customer-group test account credentials for staging — still the main access blocker before any test, including the connection smoke check, can run.

---

## 16. Next Steps

1. Get this doc approved / adjust open questions above, especially the language decision.
2. ~~Scaffold the repo per §6, get one trivial smoke test green in CI against staging.~~ A minimal connection smoke test (navigate to `https://mcstaging.accentdecor.com`, verify it resolves) is scaffolded and ready to run once repo setup happens in Claude Code — confirms reachability before any selector work.
3. Migrate a first vertical slice from the trackers end-to-end (recommend: Registration, since REG-001/REG-002 are already received in full step-by-step detail — good for validating the framework itself, though note it's a three-step B2B application, not a simple form — see §6).
4. Write the actual test plan/documentation (separate doc) covering full test case inventory, coverage priorities, and tagging strategy, cross-referenced against the original ADM-/AP-/PS- IDs.
5. Layer in Playwright performance checks (§13.1) once the E2E foundation is stable.
6. Write the first k6 checkout-load scenario (§13.2) once checkout's E2E coverage is solid enough to trust the flow it's mirroring.
