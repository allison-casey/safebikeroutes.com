import remarkGfm from 'remark-gfm';
import mdx from '@next/mdx';

const withMDX = mdx({
  options: { remarkPlugins: [remarkGfm] },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
};

export default withMDX(nextConfig);
