import mdx from "@next/mdx";
import remarkGfm from "remark-gfm";

const withMDX = mdx({
  options: { remarkPlugins: [remarkGfm] },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  // Avoid webpack-bundling jsdom (breaks isomorphic-dompurify CSS path lookup).
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
};

export default withMDX(nextConfig);
