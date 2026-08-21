# Changelog

This project follows Semantic Versioning.

## 0.2.1 - 2026-08-21

### Fixed

- Redundant requests for a known non-widening sandbox mode are now stripped even when GPT supplies an empty, missing, or malformed `justification`; malformed widening requests remain fail-closed.

## 0.2.0 - 2026-08-18

### Changed

- Rebuilt the implementation as strict TypeScript with generated declarations.
- Replaced implicit all-provider behavior with explicit provider selection; `"*"` is the only wildcard.
- Restricted rewriting to configured tools whose registered schemas advertise the complete DSH escalation contract.
- Resolved provider routing from the current session request before falling back to agent options.
- Added agentless sandbox-policy resolution and lifecycle-safe Cordis service injection.

### Security

- Malformed, incomplete, or unknown escalation requests are now preserved for DSH core validation instead of being silently downgraded.
- Third-party tools that reuse `sandbox_permissions` or `justification` are no longer modified unless explicitly opted in and schema-compatible.

### Tooling

- Added format, lint, typecheck, coverage, package-contract, Node 20/22 CI, dependency updates, and provenance publishing workflows.
