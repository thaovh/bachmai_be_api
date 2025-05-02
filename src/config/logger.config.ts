import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Đảm bảo thư mục logs tồn tại
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Hàm tạo tên file log mới với timestamp
const getNewLogFileName = (level: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(logDir, `${level}-${timestamp}.log`);
};

export const winstonLoggerOptions: winston.LoggerOptions = {
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 20,
            tailable: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
        }),
        new winston.transports.File({
            filename: 'logs/warn.log',
            level: 'warn',
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 20,
            tailable: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
        }),
        new winston.transports.File({
            filename: 'logs/info.log',
            level: 'info',
            maxsize: 20 * 1024 * 1024, // 20MB
            maxFiles: 5,
            tailable: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
        }),
        new winston.transports.Console({
            format: nestWinstonModuleUtilities.format.nestLike('BM_BACKEND', { prettyPrint: true }),
        }),
    ],
}; 