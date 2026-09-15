# NyxSignal Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the first stable NyxSignal project contract for Gemini research, structured predictions, and future outcome measurement.

**Architecture:** Gemini remains the external market-research layer. NyxSignal owns the machine-readable prediction contract and will combine predictions with normalized live market data and outcome tracking. Infrastructure such as Supabase and Vercel is intentionally deferred until persistence and deployment are needed.

**Tech Stack:** JSON Schema + Node.js ESM runtime; CoinGecko is the first isolated market-data adapter. Web framework, database, and deployment remain deferred.

**Spec:** `docs/architecture.md`

## Global Constraints

- Never treat a probability estimate as a guarantee.
- Keep probability of outcome separate from confidence in analysis.
- Preserve `prediction_id` and analysis timestamp for outcome tracking.
- A valid result may be `NO TRADE`.
- Keep provider-specific market-data shapes outside the analysis layer.
- Do not add Vercel, Supabase, exchange APIs, or automated execution until their requirements are justified by the next subsystem.

---

### Task 1: Project documentation

**Files:**
- Create: `README.md`
- Create: `docs/architecture.md`

- [x] **Step 1: Define the project purpose and system boundary**
- [x] **Step 2: Document the prediction/outcome measurement model**
- [x] **Step 3: Document deferred infrastructure decisions**

**Verification:** Read both files and confirm they consistently describe Gemini as the research layer and NyxSignal as the consuming/measurement layer.

---

### Task 2: Machine-readable Gemini contract

**Files:**
- Create: `docs/gemini-output-schema.json`

- [x] **Step 1: Define the top-level analysis structure**
- [x] **Step 2: Define opportunity, probability, risk, and allocation fields**
- [x] **Step 3: Add validation ranges for probabilities, confidence, risk, and allocation**
- [x] **Step 4: Disallow undocumented top-level and nested fields where the contract is stable**

**Verification:** Read the canonical schema and confirm its required fields and validation ranges match the approved contract.

---

### Task 3: Preserve the first real prediction snapshot

**Files:**
- Create: `data/examples/2026-09-15-market-analysis.json`

- [x] **Step 1: Store the Gemini output used to define the initial contract**
- [x] **Step 2: Preserve the three initial prediction IDs**
- [x] **Step 3: Preserve the no-trade conditions and probabilities exactly as supplied**

**Verification:** Read the fixture and confirm the three probability distributions each sum to 1.0 and the three prediction IDs are unique.

---

### Task 4: Contract validator and ingestion boundary

**Files:**
- Create: `package.json`
- Create: `src/contract/validate-analysis.mjs`
- Create: `src/contract/validate-analysis.test.mjs`
- Create: `scripts/validate-example.mjs`
- Create: `.github/workflows/ci.yml`
- Create: `src/market-data/coingecko.mjs`
- Create: `src/market-data/coingecko.test.mjs`
- Create: `docs/market-data.md`

- [x] **Step 1: Build a schema validator/ingestion layer**
  - Validate the canonical JSON Schema with Ajv 2020.
  - Enforce semantic invariants that JSON Schema cannot express: unique prediction IDs, probability sum tolerance, valid entry-zone ordering, and allocation not exceeding maximum exposure.
  - Expose a small `validateAnalysis(input)` boundary returning `{ valid, errors }`.
  - Add regression tests for the canonical fixture and each semantic invariant.
  - Add a CI workflow that runs the test suite and validates the canonical fixture.
- [x] **Step 2: Add the first live market-data integration boundary**
  - Add an isolated CoinGecko `/coins/markets` adapter.
  - Normalize provider-specific fields into a stable NyxSignal market record.
  - Surface HTTP and malformed-payload failures instead of silently returning empty data.
  - Inject `fetch` in tests so the adapter is deterministic and network-independent.
  - Expand `npm test` to discover the complete `src` test tree.
- [ ] **Step 3: Build opportunity filtering/scoring and capital-aware presentation**
- [ ] **Step 4: Add persistent prediction/outcome storage**
- [ ] **Step 5: Add calibration and historical performance analytics**
- [ ] **Step 6: Deploy the web application**

**Verification:** Contract and market-data adapter tests plus fixture validation must pass in CI before opportunity scoring begins.
