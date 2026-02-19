import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for business logic violations that don't map to standard HTTP errors.
 */
export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY) {
    super({ message, statusCode }, statusCode);
  }
}
