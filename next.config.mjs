import mdx from "@next/mdx";

const withMDX = mdx({
  // Turbopack needs serializable loader options, so plugins go by package name
  options: { remarkPlugins: ["remark-gfm"] },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default withMDX(nextConfig);
