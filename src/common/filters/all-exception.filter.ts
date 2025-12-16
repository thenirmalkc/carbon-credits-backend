import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let statusCode: number = 500;
    let errName: string = 'Unknown';
    let isArray: boolean = false;
    let message: string = 'Internal server error';
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
    } else if (exception instanceof MongoServerError) {
      errName = exception.name;
      const errCode = exception.code;
      if (errCode && errCode === 11000) {
        statusCode = 409;
        const field = exception.message.split('#')[1].split(' ')[0];
        message = `${field} already exists`;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      statusCode = 500;
      errName = exception.name;
      message = exception.message;
    }
    console.log(exception, 'exception....');
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
