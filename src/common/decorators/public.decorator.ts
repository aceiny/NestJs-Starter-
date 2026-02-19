import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as publicly accessible, bypassing authentication guards.
 *
 * @example
 * @Public()
 * @Get('health')
 * check() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
