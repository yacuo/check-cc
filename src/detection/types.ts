// CheckCC 的检测数据类型定义，用于描述地区、产品访问状态、信号结果和地区画像结构。
export type RegionCode = "auto" | "cn" | "ru" | "ir";
export type AccessStatus = "supported" | "possibly_supported" | "restricted" | "unsupported" | "unknown";
export type SignalSource = "browser" | "server" | "combined";

export type ProductAccess = {
  web: AccessStatus;
  pro: AccessStatus;
  api: AccessStatus;
  payment: AccessStatus;
};

export type SignalResult = {
  id: string;
  label: string;
  value: string | null;
  score: number;
  weight: number;
  contribution: number;
  source: SignalSource;
};

export type RegionProfile = {
  code: Exclude<RegionCode, "auto">;
  name: string;
  shortName: string;
  countries: string[];
  timezones: string[];
  languages: string[];
  browserPatterns: string[];
  devicePatterns: string[];
  fontFamilies: string[];
  weights: Record<string, number>;
  products: ProductAccess;
};

export type IpIntelSource = {
  source: string;
  status: "ok" | "unavailable";
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  asn?: string | null;
  isp?: string | null;
  org?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  networkType?: string | null;
  risk?: string | null;
  message?: string | null;
};

export type IpIntelligence = {
  summary: string;
  sources: IpIntelSource[];
  consistentCountry: boolean | null;
  detectedIp: string | null;
  detectedCountry: string | null;
  detectedAsn: string | null;
  warnings: string[];
};

export type CheckResponse = {
  app: "Check Claude";
  domain: "checkcc.org";
  region: RegionCode;
  matchedRegion: Exclude<RegionCode, "auto"> | null;
  detectedCountry: string | null;
  detectedTimezone: string | null;
  score: number;
  status: AccessStatus;
  products: ProductAccess;
  signals: SignalResult[];
  ipIntelligence?: IpIntelligence;
  recommendations: string[];
  disclaimer: string;
};
