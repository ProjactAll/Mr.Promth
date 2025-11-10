/**
 * Production Configuration
 * Settings optimized for international-scale operations
 */

export const PRODUCTION_CONFIG = {
  // Application
  app: {
    name: 'Mr.Prompt',
    version: '1.0.0',
    environment: 'production',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mrpromth-azure.vercel.app',
    supportedLanguages: ['th', 'en'],
    defaultLanguage: 'th'
  },

  // Performance
  performance: {
    // Caching
    cache: {
      enabled: true,
      ttl: {
        static: 86400, // 24 hours
        dynamic: 3600, // 1 hour
        api: 300 // 5 minutes
      }
    },

    // Rate Limiting
    rateLimit: {
      api: {
        requests: 100,
        window: 60 // seconds
      },
      chat: {
        requests: 20,
        window: 60
      },
      workflow: {
        requests: 10,
        window: 60
      }
    },

    // Timeouts
    timeouts: {
      api: 30000, // 30 seconds
      ai: 60000, // 60 seconds
      database: 10000 // 10 seconds
    },

    // Concurrent Requests
    concurrency: {
      maxPerModel: 5,
      maxTotal: 50
    }
  },

  // AI Configuration
  ai: {
    // Model Settings
    models: {
      total: 19,
      tokenPool: 20000000, // 20M tokens
      defaultTemperature: 0.7,
      defaultMaxTokens: 2000
    },

    // Load Balancing
    loadBalancing: {
      strategy: 'round-robin', // 'round-robin' | 'random' | 'least-used'
      enableFailover: true,
      maxRetries: 3,
      retryDelay: 1000 // ms
    },

    // Monitoring
    monitoring: {
      trackUsage: true,
      logRequests: true,
      alertThreshold: 0.8 // 80% of token pool
    }
  },

  // Database
  database: {
    // Connection Pool
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000
    },

    // Query Optimization
    query: {
      timeout: 10000,
      maxRows: 1000,
      enablePreparedStatements: true
    },

    // Caching
    cache: {
      enabled: true,
      ttl: 300 // 5 minutes
    }
  },

  // Security
  security: {
    // CORS
    cors: {
      enabled: true,
      origins: [
        process.env.NEXT_PUBLIC_APP_URL || 'https://mrpromth-azure.vercel.app',
        'https://*.vercel.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    },

    // Headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    },

    // Authentication
    auth: {
      sessionTimeout: 3600, // 1 hour
      refreshTokenExpiry: 604800, // 7 days
      maxLoginAttempts: 5,
      lockoutDuration: 900 // 15 minutes
    },

    // Content Security Policy
    csp: {
      enabled: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://liywmjxhllpexzrnuhlu.supabase.co']
      }
    }
  },

  // Monitoring & Logging
  monitoring: {
    // Error Tracking
    errorTracking: {
      enabled: true,
      sampleRate: 1.0, // 100%
      ignoreErrors: ['NetworkError', 'AbortError']
    },

    // Performance Monitoring
    performance: {
      enabled: true,
      sampleRate: 0.1, // 10%
      trackWebVitals: true
    },

    // Logging
    logging: {
      level: 'info', // 'debug' | 'info' | 'warn' | 'error'
      format: 'json',
      destinations: ['console', 'file'],
      retention: 30 // days
    }
  },

  // Features
  features: {
    // User Features
    user: {
      maxProjects: 100,
      maxFilesPerProject: 1000,
      maxChatSessions: 50,
      maxMessagesPerSession: 1000
    },

    // AI Features
    ai: {
      enableStreaming: true,
      enableCodeGeneration: true,
      enableMultiAgent: true,
      enableFailover: true
    },

    // Experimental
    experimental: {
      enableBetaFeatures: false,
      enableDebugMode: false
    }
  },

  // Internationalization
  i18n: {
    enabled: true,
    defaultLocale: 'th',
    locales: ['th', 'en'],
    fallbackLocale: 'en',
    detection: {
      order: ['cookie', 'header', 'navigator'],
      caches: ['cookie']
    }
  },

  // SEO
  seo: {
    enabled: true,
    siteName: 'Mr.Prompt',
    siteDescription: 'AI-Powered Web Application Generator',
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://mrpromth-azure.vercel.app',
    ogImage: '/og-image.png',
    twitterHandle: '@mrprompt'
  },

  // Analytics
  analytics: {
    enabled: true,
    providers: {
      vercel: {
        enabled: true
      },
      google: {
        enabled: false,
        trackingId: ''
      }
    }
  },

  // Maintenance
  maintenance: {
    mode: false,
    message: 'We are currently performing maintenance. Please check back soon.',
    allowedIPs: [] // Admin IPs that can access during maintenance
  }
}

/**
 * Get configuration value
 */
export function getConfig<T = any>(path: string, defaultValue?: T): T {
  const keys = path.split('.')
  let value: any = PRODUCTION_CONFIG

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return defaultValue as T
    }
  }

  return value as T
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: string): boolean {
  return getConfig(`features.${feature}`, false)
}

/**
 * Get rate limit for endpoint
 */
export function getRateLimit(endpoint: 'api' | 'chat' | 'workflow') {
  return getConfig(`performance.rateLimit.${endpoint}`, {
    requests: 60,
    window: 60
  })
}

/**
 * Get timeout for service
 */
export function getTimeout(service: 'api' | 'ai' | 'database'): number {
  return getConfig(`performance.timeouts.${service}`, 30000)
}

/**
 * Check if in maintenance mode
 */
export function isMaintenanceMode(): boolean {
  return getConfig('maintenance.mode', false)
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): string[] {
  return getConfig('app.supportedLanguages', ['th', 'en'])
}

/**
 * Get default language
 */
export function getDefaultLanguage(): string {
  return getConfig('app.defaultLanguage', 'th')
}

export default PRODUCTION_CONFIG
