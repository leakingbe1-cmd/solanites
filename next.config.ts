import type { NextConfig } from "next";

/** Sent with every response. No script CSP yet (the intro's pre-paint script is inline). */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

/**
 * Owner tools (/studio) hold classified data and owner credentials, so nothing third-party may
 * load there: scripts, frames and connections are same-origin only (inline scripts stay allowed
 * for Next's own bootstrap). Sent in addition to the site-wide policy above; both apply.
 */
const studioCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Database drivers run as plain Node modules on the server, not bundled.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/studio/:path*", headers: [{ key: "Content-Security-Policy", value: studioCsp }] },
      { source: "/studio", headers: [{ key: "Content-Security-Policy", value: studioCsp }] },
    ];
  },
};

export default nextConfig;
