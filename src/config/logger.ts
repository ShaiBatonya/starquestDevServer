// src/config/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';
import { vars } from './vars';

const { nodeEnv } = vars;

const logLevel = 'debug';
const logDir = 'logs';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => logLevel || (nodeEnv === 'development' ? 'debug' : 'warn');

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: `${logDir}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
  }),
  new winston.transports.DailyRotateFile({
    filename: `${logDir}/all-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels: logLevels,
  format,
  transports,
});

export default Logger;
