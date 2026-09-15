# NyxSignal Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the first stable NyxSignal project contract for Gemini research, structured predictions, and future outcome measurement.

**Architecture:** Gemini remains the external market-research layer. NyxSignal owns the machine-readable prediction contract and combines predictions with normalized live market data and outcome tracking. The MVP uses browser-local persistence; server-side storage is deferred until multi-user history is required.

**Tech Stack:** JSON Schema + Node.js ESM runtime + Next.js App Router; CoinGecko is the first isolated market-data adapter.

**Spec:** `docs/architecture.md`

## Global Constraints

- Never treat a probability estimate as a guarantee.
- Keep probability of outcome separate from confidence in analysis.
- Preserve `prediction_id` and analysis timestamp for outcome tracking.
- A valid result may be `NO TRADE`.
- Keep provider-specific market-data shapes outside the analysis layer.
- Do not add automated execution until its requirements are explicitly justified.

---

### Task 1: Project documentation

- [x] Define the project purpose and system boundary.
- [x] Document the prediction/outcome measurement model.
- [x] Document deferred infrastructure decisions.

### Task 2: Machine-readable Gemini contract

- [x] Define the top-level analysis structure.
- [x] Define opportunity, probability, risk, and allocation fields.
- [x] Add validation ranges and stable-field restrictions.

### Task 3: Preserve the first real prediction snapshot

- [x] Store the initial Gemini output used to define the contract.
- [x] Preserve the three prediction IDs, probabilities, and no-trade conditions.

### Task 4: Contract, market data, scoring, and MVP application

- [x] Schema validator and semantic ingestion boundary.
- [x] Isolated CoinGecko market-data adapter with deterministic tests.
- [x] Deterministic opportunity filtering/scoring and capital-aware presentation.
- [x] Prediction store boundary with atomic filesystem persistence for server-side use.
- [x] Browser-local prediction outcome tracking for the MVP.
- [x] Calibration analytics using accuracy and multiclass Brier score.
- [x] Next.js dashboard with live market radar and structured research snapshot.
- [x] CI verifies tests, fixture validation, and production build.

### Task 5: Deployment

- [ ] Connect the repository to a Vercel project and deploy the production MVP.
- [ ] Verify the deployed dashboard and live market API.

**Current state:** The codebase is MVP-ready and the GitHub CI build is green. Deployment is the remaining infrastructure step because this session has no Vercel team/project connection available.
