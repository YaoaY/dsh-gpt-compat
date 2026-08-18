import { isEscalationTarget, isSandboxMode, isStrictlyWider } from "./sandbox-modes.js";

export const ESCALATION_KEYS = ["sandbox_permissions", "justification"] as const;
export type EscalationKey = (typeof ESCALATION_KEYS)[number];

export type EscalationDecision =
  | { readonly kind: "none" }
  | { readonly kind: "strip"; readonly keys: typeof ESCALATION_KEYS; readonly reason: "redundant" }
  | {
      readonly kind: "preserve";
      readonly reason: "valid-escalation" | "invalid-request" | "unknown-contract";
    };

function hasValue(args: Record<string, unknown>, key: EscalationKey): boolean {
  return args[key] !== undefined;
}

/**
 * Classify one model-supplied escalation pair without mutating the arguments.
 * Unknown or malformed security-sensitive input is preserved for DSH core validation.
 */
export function classifyEscalation(
  args: Record<string, unknown> | undefined,
  currentMode: unknown
): EscalationDecision {
  if (args === undefined) return { kind: "none" };

  const hasRequested = hasValue(args, "sandbox_permissions");
  const hasJustification = hasValue(args, "justification");
  if (!hasRequested && !hasJustification) return { kind: "none" };
  if (!isSandboxMode(currentMode)) return { kind: "preserve", reason: "unknown-contract" };
  if (!hasRequested || !hasJustification) return { kind: "preserve", reason: "invalid-request" };

  const requested = args.sandbox_permissions;
  const justification = args.justification;
  if (!isEscalationTarget(requested)) return { kind: "preserve", reason: "invalid-request" };
  if (typeof justification !== "string" || justification.trim().length === 0) {
    return { kind: "preserve", reason: "invalid-request" };
  }
  if (isStrictlyWider(requested, currentMode)) return { kind: "preserve", reason: "valid-escalation" };
  return { kind: "strip", keys: ESCALATION_KEYS, reason: "redundant" };
}

/**
 * Return the two keys to remove only when the request is a known redundant escalation.
 * This compatibility helper is intentionally fail-closed for malformed input.
 */
export function planEscalationStripping(
  args: Record<string, unknown> | undefined,
  currentMode: unknown
): readonly EscalationKey[] {
  const decision = classifyEscalation(args, currentMode);
  return decision.kind === "strip" ? decision.keys : [];
}
