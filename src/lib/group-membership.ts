import type { Group } from "@/types/workspace";

// Explicit null means independent; a missing value supports older cached records.
export function getGroupEnterprise(
  group: Group,
  legacyEnterprise = "Enterprise A",
): string | null {
  return group.enterpriseName === null
    ? null
    : group.enterpriseName || legacyEnterprise;
}
