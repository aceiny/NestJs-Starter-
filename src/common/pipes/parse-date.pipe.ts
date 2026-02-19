import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Parse and validate a string parameter as a Date.
 * Throws BadRequestException if the value is not a valid ISO date string.
 */
@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`"${value}" is not a valid date`);
    }
    return date;
  }
}