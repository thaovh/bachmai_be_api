import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    message: string;
    statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    private readonly logger = new Logger(TransformInterceptor.name);
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map(data => {
                const res = {
                    data,
                    message: 'Success',
                    statusCode: context.switchToHttp().getResponse().statusCode,
                };
                this.logger.log(`Response: ${JSON.stringify(res)}`);
                return res;
            }),
        );
    }
} 