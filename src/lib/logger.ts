import pino from 'pino';

const pinoLogger = pino({
  level: 'debug',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

const formatError = (message: string): string => {
  return message.startsWith('[Error') ? message : `[Error]: ${message}`;
};

const formatHttpError = (status: number, message: string): string => {
  return `[Error ${status}]: ${message}`;
};

export const logger = {
  httpError: (context: Record<string, unknown>, status: number, message: string): string => {
    const formattedMessage = formatHttpError(status, message);
    pinoLogger.error(context, formattedMessage);
    return formattedMessage;
  },

  error: (context: Record<string, unknown>, message: string): string => {
    const formattedMessage = formatError(message);
    pinoLogger.error(context, formattedMessage);
    return formattedMessage;
  },

  info: (context: Record<string, unknown> | string, message?: string) => {
    if (typeof context === 'string') {
      pinoLogger.info(message || context);
    } else {
      pinoLogger.info(context, message);
    }
  },

  warn: (context: Record<string, unknown> | string, message?: string) => {
    if (typeof context === 'string') {
      pinoLogger.warn(message || context);
    } else {
      pinoLogger.warn(context, message);
    }
  },

  debug: (context: Record<string, unknown> | string, message?: string) => {
    if (typeof context === 'string') {
      pinoLogger.debug(message || context);
    } else {
      pinoLogger.debug(context, message);
    }
  },
};
