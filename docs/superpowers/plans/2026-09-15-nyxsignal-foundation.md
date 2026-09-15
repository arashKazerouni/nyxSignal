# NyxSignal Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the first stable NyxSignal project contract for Gemini research, structured predictions, and future outcome measurement.

**Architecture:** Gemini remains the external market-research layer. NyxSignal owns the machine-readable prediction contract and will later combine predictions with live market data and outcome tracking. Infrastructure such as Supabase and Vercel is intentionally deferred until persistence and deployment are needed.

**Tech Stack:** Documentation + JSON Schema in the initial phase; application/runtime stack to be selected after the data contract is validated.

**Spec:** `docs/architecture.md`

## Global Constraints

- Never treat a probability estimate as a guarantee.
- Keep probability of outcome separate from confidence in analysis.
- Preserve `prediction_id` and analysis timestamp for outcome tracking.
- A valid result may be `NO TRADE`.
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

**Verification:** Parse the schema as JSON and validate the example payload against the schema before the application layer is built.

---

### Task 3: Preserve the first real prediction snapshot

**Files:**
- Create: `data/examples/2026-09-15-market-analysis.json`

- [x] **Step 1: Store the Gemini output used to define the initial contract**
- [x] **Step 2: Preserve the three initial prediction IDs**
- [x] **Step 3: Preserve the no-trade conditions and probabilities exactly as supplied**

**Verification:** Parse the example as JSON and compare its structure with `docs/gemini-output-schema.json`.

---

### Task 4: Next implementation boundary

**Files:**
- Future application files only after the contract is validated.

- [ ] **Step 1: Build a schema validator/ingestion layer**
- [ ] **Step 2: Add live market-data integration**
- [ ] **Step 3: Build opportunity filtering/scoring and capital-aware presentation**
- [ ] **Step 4: Add persistent prediction/outcome storage**
- [ ] **Step 5: Add calibration and historical performance analytics**
- [ ] **Step 6: Deploy the web application**

**Verification:** Each subsystem must have its own test cycle before the next dependency is introduced.
