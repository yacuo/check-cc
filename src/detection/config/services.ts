import type { DetectionServiceConfig } from "./types";

export const serviceConfig: Record<string, DetectionServiceConfig> = {
  ipIntel: {
    enabled: false,
    endpoint: "/api/ip-intel",
    timeoutMs: 3500,
  },
};
