import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';

/**
 * Apply class serialization to a controller or handler.
 * Uses class-transformer to serialize response entities.
 */
export function Serialize() {
  return applyDecorators(UseInterceptors(ClassSerializerInterceptor));
}
