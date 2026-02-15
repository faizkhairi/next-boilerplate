import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  browser: {
    asObject: true,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

/**
 * Create a child logger with additional context
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context)
}

/**
 * Log audit events (auth, security, etc.)
 */
export function logAudit(event: string, data: Record<string, any>) {
  logger.info({ audit: true, event, ...data }, `[AUDIT] ${event}`)
}

/**
 * Log errors with structured data
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    error.message
  )
}

/**
 * Log HTTP requests (for API routes)
 */
export function logRequest(method: string, url: string, statusCode: number, duration: number) {
  logger.info(
    {
      http: {
        method,
        url,
        statusCode,
        duration,
      },
    },
    `${method} ${url} ${statusCode} - ${duration}ms`
  )
}
