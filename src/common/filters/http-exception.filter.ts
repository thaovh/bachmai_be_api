import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = 'Error';
        let message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        let code = ERROR_CODES.INTERNAL_SERVER_ERROR;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            error = exception.name;
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                code = (exceptionResponse as any).code || code;
            }
        } else if (exception?.message) {
            message = exception.message;
        }

        const errorResponse = {
            statusCode: status,
            error,
            message,
            code,
        };

        this.logger.error(`Exception: ${JSON.stringify(errorResponse)}`);
        response.status(status).json(errorResponse);
    }
} 