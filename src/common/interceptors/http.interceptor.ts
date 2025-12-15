import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { UserI } from '../types';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { user: UserI }>();

    // // wip: can make process body and populate data same method
    // if (req.body) {
    //   processBody(req.body);
    // }

    if (req.body && req.user && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      populateData(req.body, req.user, req.method);
    }

    return next.handle().pipe(
      map((value: unknown) => {
        const res = context.switchToHttp().getResponse<Response>();
        const statusCode = res.statusCode;
        let status = true;
        if (statusCode >= 400) {
          status = false;
        }
        return {
          status,
          statusCode,
          data: instanceToPlain(value),
          timestamp: Date.now() / 1000,
        };
      }),
    );
  }
}

const emailFields = ['email'];

/* eslint-disable */
function processBody(data: any) {
  if (Array.isArray(data)) {
    for (const d of data) {
      processBody(d);
    }
  } else if (data instanceof Object) {
    for (const k in data) {
      if (emailFields.includes(k) && data[k] && typeof data[k] === 'string') {
        data[k] = data[k].toLowerCase();
      }
      if (!data[k]) {
        if (data[k] === '') {
          data[k] = null;
        }
        continue;
      } else if (Array.isArray(data[k]) || data[k] instanceof Object) {
        processBody(data[k]);
      } else if (typeof data[k] === 'string') {
        data[k] = data[k].trim();
      }
    }
  } else if (typeof data === 'string') {
    data = data.trim();
  }
}
/* eslint-enable */

/* eslint-disable */
function populateData(data: any, user: UserI, method: string) {
  if (Array.isArray(data)) {
    for (const d of data) {
      populateData(d, user, method);
    }
  } else if (data instanceof Object) {
    for (const k in data) {
      const value = data[k];
      if (!value) continue;
      if (Array.isArray(value) || value instanceof Object) {
        populateData(value, user, method);
      }
    }
    // populate createdBy
    if (method === 'POST') {
      data.createdById = user._id;
    }
    // populate updatedBy
    else if (['PUT', 'PATCH'].includes(method)) {
      data.updatedById = user._id;
    }
  }
}
/* eslint-enable */
