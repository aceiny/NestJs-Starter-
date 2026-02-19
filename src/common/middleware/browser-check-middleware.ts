import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class BrowserCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user_agent = req.headers["user-agent"];
    const referer = req.headers.referer;
    const origin = req.headers.origin;

    if (!user_agent || !/Mozilla|Chrome|Safari|Firefox|Edge/.test(user_agent)) {
      throw new ForbiddenException("Access Denied: please use a browser");
    }

    if (!referer && !origin) {
      throw new ForbiddenException("Access Denied: Missing Referer or Origin");
    }

    next();
  }
}
