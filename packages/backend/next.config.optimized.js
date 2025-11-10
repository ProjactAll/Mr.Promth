/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production Optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance
  compress: true,
  poweredByHeader: false,
  
  // Image Optimization
  images: {
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || 'liywmjxhllpexzrnuhlu.supabase.co',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com'
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Headers for Security and Performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Cache Static Assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache Images
      {
        source: '/:path*.{jpg,jpeg,png,gif,webp,avif,ico,svg}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate'
          }
        ]
      },
      // Cache Fonts
      {
        source: '/:path*.{woff,woff2,ttf,otf,eot}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Redirects
  async redirects() {
    return [
      // Redirect old paths if any
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true
      // }
    ]
  },

  // Rewrites for API
  async rewrites() {
    return [
      // Add rewrites if needed
    ]
  },

  // Webpack Configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Replace React with Preact in production
      Object.assign(config.resolve.alias, {
        // Uncomment to use Preact (smaller bundle)
        // 'react': 'preact/compat',
        // 'react-dom/test-utils': 'preact/test-utils',
        // 'react-dom': 'preact/compat',
      })
    }

    // Add custom webpack rules
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })

    return config
  },

  // Environment Variables (public)
  env: {
    NEXT_PUBLIC_APP_NAME: 'Mr.Prompt',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || 'https://mrpromth-azure.vercel.app'
  },

  // Experimental Features
  experimental: {
    // Enable optimizations
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
    
    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  // Output
  output: 'standalone',

  // TypeScript
  typescript: {
    // Ignore build errors in production (not recommended)
    // ignoreBuildErrors: false
  },

  // ESLint
  eslint: {
    // Ignore lint errors in production (not recommended)
    // ignoreDuringBuilds: false
  },

  // Internationalization
  i18n: {
    locales: ['th', 'en'],
    defaultLocale: 'th',
    localeDetection: true
  },

  // Trailing Slash
  trailingSlash: false,

  // Generate ETags
  generateEtags: true,

  // Page Extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Disable x-powered-by header
  poweredByHeader: false
}

module.exports = nextConfig
