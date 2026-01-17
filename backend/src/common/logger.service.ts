import { Logger } from '@nestjs/common';

/**
 * Logger Service - Use this service for logging throughout the application
 * 
 * Usage examples:
 * 
 * 1. In services/controllers:
 *    import { LoggerService } from '../common/logger.service';
 *    private readonly logger = new LoggerService(YourClassName.name);
 *    
 *    this.logger.log('Info message');
 *    this.logger.error('Error message', error.stack);
 *    this.logger.warn('Warning message');
 *    this.logger.debug('Debug message');
 * 
 * 2. For HTTP requests - use LoggerMiddleware (already configured)
 * 
 * 3. For database operations:
 *    this.logger.log(`Creating event: ${eventData.title}`);
 *    this.logger.error(`Failed to create event: ${error.message}`);
 */
export class LoggerService extends Logger {
  constructor(context?: string) {
    super(context);
  }

  log(message: string, context?: string) {
    super.log(message, context || this.context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context || this.context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context || this.context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context || this.context);
  }
}
