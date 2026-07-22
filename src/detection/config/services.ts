// CheckCC 的检测服务配置，用于控制外部 IP 情报等后端检测服务的开关、接口和超时时间。
import type { DetectionServiceConfig } from "./types";

export const serviceConfig: Record<string, DetectionServiceConfig> = {
  ipIntel: {
    enabled: false,
    endpoint: "/api/ip-intel",
    timeoutMs: 3500,
  },
};
