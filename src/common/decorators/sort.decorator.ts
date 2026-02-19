import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { getMetadataArgsStorage } from "typeorm";
import { SortOrder } from "../enums";

export interface SortOptions {
  allowedFields?: string[];
  defaultField?: string;
  defaultOrder?: SortOrder;
  /** Optional entity class to derive sortable columns from TypeORM metadata */
  entity?: Function;
}

export interface ISortQuery {
  field: string;
  order: SortOrder;
}

/**
 * Creates a decorator that parses and validates `sortBy` and `sortDir` query params.
 * If `entity` is provided, allowed fields are derived from TypeORM metadata for that entity (includes inherited columns).
 * Usage: @Sort({ entity: User, defaultField: 'createdAt' }) sort: ISortQuery
 *
 * NOTE: For backward-compatibility this will also accept `sort` and `sortOrder`.
 */
export const Sort = createParamDecorator(
  (data: SortOptions | undefined, ctx: ExecutionContext): ISortQuery => {
    const req = ctx.switchToHttp().getRequest();
    const query = req.query || {};

    let derivedAllowedFields: string[] = [];
    if (data?.entity) {
      const storage = getMetadataArgsStorage();
      const columns = storage.columns || [];

      const entityConstructor = data.entity as Function;

      const isPrototypeOf = (base: Function, child: Function) => {
        if (!base || !child) return false;
        return (
          base.prototype &&
          child.prototype &&
          base.prototype.isPrototypeOf(child.prototype)
        );
      };

      derivedAllowedFields = columns
        .filter((c) => {
          const colTarget = c.target as Function;
          return (
            colTarget === entityConstructor ||
            (typeof colTarget === "function" &&
              isPrototypeOf(colTarget, entityConstructor))
          );
        })
        .map((c) => c.propertyName);
    }

    const allowedFields = data?.allowedFields ?? derivedAllowedFields ?? [];

    const defaultField =
      data?.defaultField ??
      (allowedFields.length ? allowedFields[0] : "createdAt");
    const defaultOrder = data?.defaultOrder ?? "DESC";

    // Prefer new query param names, fall back to legacy names for compatibility
    const sortField = query.sortBy ?? query.sort ?? defaultField;
    const sortOrder = (
      query.sortDir ??
      query.sortOrder ??
      defaultOrder
    ).toUpperCase();

    if (allowedFields.length && !allowedFields.includes(sortField)) {
      throw new BadRequestException(
        `Invalid sortBy field. Allowed fields: ${allowedFields.join(", ")}`,
      );
    }

    if (!["ASC", "DESC"].includes(sortOrder)) {
      throw new BadRequestException("sortDir must be either ASC or DESC");
    }

    return { field: sortField, order: sortOrder as SortOrder };
  },
);
