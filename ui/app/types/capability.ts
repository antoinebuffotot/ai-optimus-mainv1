export type CapabilityCategory =
  | "Intelligence"
  | "Assist"
  | "Workflows"
  | "MCP"
  | "LogAI"
  | "AIObservability"
  | "Other";

export type CapabilityStatus =
  | "active"
  | "inactive"
  | "partial"
  | "unlicensed"
  | "unknown";

export interface CapabilityRegistryEntry {
  id: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  useCases: string[];
  docUrl: string;
  videoUrl?: string | null;
  relatedCapabilityIds?: string[];
}

export interface CapabilityRegistry {
  version: string;
  updatedAt?: string;
  categories: CapabilityCategory[];
  capabilities: CapabilityRegistryEntry[];
}

export interface CapabilityStatusEntry {
  id: string;
  status: CapabilityStatus;
}

export interface CapabilityStatusSnapshot {
  fetchedAt: number;
  entries: CapabilityStatusEntry[];
}

export interface CapabilityView extends CapabilityRegistryEntry {
  status: CapabilityStatus;
}
