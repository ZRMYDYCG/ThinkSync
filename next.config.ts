import type { Editor } from 'launch-ide'
import type { NextConfig } from 'next'

import { codeInspectorPlugin } from 'code-inspector-plugin'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const codeEditor = process.env.CODE_EDITOR as Editor | undefined

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'qy-red-book.oss-cn-guangzhou.aliyuncs.com',
        pathname: '/i/**',
      },
    ],
  },

  productionBrowserSourceMaps: true,

  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
      editor: codeEditor ?? 'code',
    }),
  },
}

export default withNextIntl(nextConfig)
