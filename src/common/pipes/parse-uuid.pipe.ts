import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate, version } from 'uuid';

/**
 * Validate that a string parameter is a valid UUID (v4 by default).
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  constructor(private readonly expectedVersion: number = 4) {}

  transform(value: string): string {
    if (!validate(value) || version(value) !== this.expectedVersion) {
      throw new BadRequestException(`"${value}" is not a valid UUID v${this.expectedVersion}`);
    }
    return value;
  }
}
