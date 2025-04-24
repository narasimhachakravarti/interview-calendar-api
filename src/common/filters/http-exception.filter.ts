import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const message =
        exception instanceof HttpException
          ? exception.getResponse()
          : { message: 'Internal server error' };
  
      // Log the error details
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
        exception instanceof Error ? exception.stack : '',
      );
  
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(typeof message === 'string' ? { message } : message),
      });
    }
  }
  