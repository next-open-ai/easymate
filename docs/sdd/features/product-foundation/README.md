# Product foundation P0/P1

Status: Verified (2026-10-06)

## Requirements

- `PF-001` All checked-in CI commands must exist and be locally runnable.
- `PF-002` The headless orchestration smoke test must start an isolated authenticated API by default.
- `PF-003` Release size checks must measure explicit, realistic budgets and report actionable values.
- `PF-004` Product identity, runtime defaults and enabled renderer features have one versioned manifest contract.
- `PF-005` Renderer navigation and availability derive from a feature registry, not duplicated hard-coded lists.
- `PF-006` Shared storage supports versioned envelopes and deterministic migrations without destroying old data.
- `PF-007` Shared UI tokens are exported from `@easymate/ui-kit`.

## Tasks

- `PF-T01` Reconcile single-Pi CI, documentation and scripts.
- `PF-T02` Repair authenticated managed orchestration smoke coverage.
- `PF-T03` Add package licensing and release-size gates.
- `PF-T04` Add `ProductManifestV1` contract, default manifest and renderer feature registry.
- `PF-T05` Promote storage and UI-kit placeholders into tested foundational packages.

## Verification

- `PF-V01`: `pnpm test`
- `PF-V02`: `pnpm typecheck`
- `PF-V03`: `pnpm build`
- `PF-V04`: `pnpm orch:smoke`
- `PF-V04A`: `pnpm auth:regression`
- `PF-V05`: `pnpm size:check`
- `PF-V06`: `pnpm product:regression`
- `PF-V07`: `pnpm docs:build`

## Compatibility and rollback

The default manifest preserves the existing EasyMate name, ports, data directory and visible features. Product overrides are build-time JSON and contain no secrets. Removing the override restores the default. Versioned storage decoding preserves legacy unwrapped values and migrations return a new envelope rather than mutating the input.

## Verification evidence

On 2026-10-06 the workspace passed `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm orch:smoke`, `pnpm auth:regression`, `pnpm size:check`, `pnpm product:regression`, and `pnpm docs:build`. `npm pack --dry-run --json` also completed successfully. Desktop installer packaging and the opt-in concurrency load test were not run because they are platform/long-running checks.
