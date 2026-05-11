import registryJson from "../../assets/capability-registry.json";
import type {
  CapabilityRegistry,
  CapabilityRegistryEntry,
  CapabilityStatus,
  CapabilityStatusEntry,
  CapabilityView,
} from "../types/capability";

export const registry: CapabilityRegistry = registryJson as CapabilityRegistry;

export const getCapability = (
  id: string
): CapabilityRegistryEntry | undefined =>
  registry.capabilities.find((c) => c.id === id);

export const mergeStatus = (
  entries: CapabilityStatusEntry[] | undefined
): CapabilityView[] => {
  const byId = new Map<string, CapabilityStatus>(
    (entries ?? []).map((e) => [e.id, e.status])
  );
  return registry.capabilities.map((c) => ({
    ...c,
    status: byId.get(c.id) ?? "inactive",
  }));
};

export const computeCoverageScore = (views: CapabilityView[]): number => {
  if (views.length === 0) return 0;
  const eligible = views.filter((v) => v.status !== "unlicensed");
  if (eligible.length === 0) return 0;
  const active = eligible.filter(
    (v) => v.status === "active" || v.status === "partial"
  ).length;
  return Math.round((active / eligible.length) * 100);
};
