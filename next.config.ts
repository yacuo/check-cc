// Next 静态导出配置
import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // 允许从局域网 IP（手机真机调试）访问 dev 资源（HMR / JS chunk / 字体）。
  // 否则 Next.js 16 默认拦截跨源 dev 请求，导致手机端 React 无法 hydrate，按钮点击失效。
  allowedDevOrigins: [
    "192.168.1.32",
    "192.168.1.*",
    "192.168.0.*",
    "10.0.0.*",
    "172.16.*",
  ],
};

export default nextConfig;
