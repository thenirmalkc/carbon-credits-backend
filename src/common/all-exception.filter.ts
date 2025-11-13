import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let statusCode: number;
    let errName: string;
    let isArray: boolean = false;
    let message: string;
    let messages: Record<string, string>[] | undefined;
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errName = exception.name;
      const errRes = exception.getResponse();
      if (typeof errRes === 'string') {
        message = errRes;
      } else {
        const errMessage = <string | string[]>errRes['message'];
        if (Array.isArray(errMessage)) {
          isArray = true;
          messages = [];
          for (let errMsg of errMessage) {
            const field = errMsg.split(' ')[0];
            if (errMsg.includes('must be an email')) {
              errMsg = 'Must be a valid email address';
            }
            messages.push({ field, message: errMsg });
          }
          if (messages.length) {
            message = messages[0].message;
          } else {
            message = 'Validation error';
          }
        } else {
          message = errMessage;
        }
      }
    } else if (exception instanceof Error) {
      statusCode = 500;
      errName = exception.name;
      message = exception.message;
    } else {
      statusCode = 500;
      errName = 'Unknown';
      message = 'Internal server error';
    }
    res.status(statusCode).json({
      status: false,
      statusCode,
      errName,
      isArray,
      message,
      messages,
      timestamp: Date.now() / 1000,
    });
  }
}
