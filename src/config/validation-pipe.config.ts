import { ValidationPipeOptions } from "@nestjs/common";

export const ValidationPipeConfig : ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
}