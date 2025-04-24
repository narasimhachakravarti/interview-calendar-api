import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map, tap } from 'rxjs/operators';
  
  export interface Response<T> {
    data: T;
    statusCode: number;
    timestamp: string;
  }
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
  {
    private readonly logger = new Logger(TransformInterceptor.name);
  
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T>> {
      const request = context.switchToHttp().getRequest();
      const method = request.method;
      const url = request.url;
      
      const now = Date.now();
      
      return next.handle().pipe(
        tap(() => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          
          this.logger.log(
            `${method} ${url} ${statusCode} - ${Date.now() - now}ms`,
          );
        }),
        map((data) => ({
          data,
          statusCode: context.switchToHttp().getResponse().statusCode,
          timestamp: new Date().toISOString(),
        })),
      );
    }
  }