# Operability and E2E P2

Status: Verified (2026-10-06)

## Requirements

- `OPS-001` Mutating API operations emit bounded structured audit events without request bodies, tokens, prompts or secrets.
- `OPS-002` An administrator can download a diagnostic bundle containing only allowlisted runtime metadata, recovery state and recent redacted audit events.
- `OPS-003` API startup records an unclean previous exit and orchestration reconciles orphaned runs on boot.
- `E2E-001` Playwright verifies the Web authentication/navigation baseline against an isolated API.
- `E2E-002` Playwright launches Electron and verifies the renderer/preload baseline.

## Verification

`pnpm audit:regression`, `pnpm e2e:web`, `pnpm e2e:electron`, `pnpm test`, `pnpm typecheck`, and `pnpm build`.

## Evidence and boundaries

Verified locally on macOS arm64 on 2026-10-06. Web Chromium and Electron tests passed. Audit regression verifies that a simulated unclean previous exit is reported and that secrets are absent from the generated ZIP. Existing orchestrator `recoverOnBoot()` remains the single owner for reconciling orphaned chat/project runs. The bundle deliberately excludes request bodies, prompts, provider configuration, tokens and user files.
