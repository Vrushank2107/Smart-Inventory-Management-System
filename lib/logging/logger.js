import fs from "fs";
import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.metadata && Object.keys(info.metadata).length > 0 
        ? ` ${JSON.stringify(info.metadata)}` 
        : ''
    }`
  ),
);

const enableFileLogs =
  process.env.NODE_ENV !== "production" || process.env.ENABLE_FILE_LOGS === "true";

const transports = [
  new winston.transports.Console({
    format,
  }),
];

// On platforms like Vercel, the filesystem may be read-only. If file logging fails
// in production, we still want API routes to work and return JSON errors.
if (enableFileLogs) {
  try {
    fs.mkdirSync("logs", { recursive: true });
    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      new winston.transports.File({
        filename: "logs/combined.log",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  } catch {
    // Ignore file logging failures and keep using console transport only.
  }
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

export const createRequestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
  });
  
  next();
};

export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

export const logInfo = (message, metadata = {}) => {
  logger.info(message, metadata);
};

export const logWarn = (message, metadata = {}) => {
  logger.warn(message, metadata);
};
