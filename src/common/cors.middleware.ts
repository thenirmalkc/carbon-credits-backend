import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const allowedHeaders = ['Content-Type', 'Authorization'];
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',');
    const origin = req.headers.origin!;
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
    }
    // preflight check of cors
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  }
}
