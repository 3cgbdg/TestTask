import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();
    const userAgent = req.get('user-agent') || '';

    // Log request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Log request body for POST, PUT, PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = { ...req.body };
      // Remove sensitive fields if needed
      if (body.password) delete body.password;
      if (body.token) delete body.token;
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(req.query)}`);
    }

    // Capture response
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength || 0}b`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
