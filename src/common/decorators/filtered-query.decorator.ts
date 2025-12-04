import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const FilteredQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const query = { ...request.query };
    query.limit = query.limit || process.env.LIMIT;
    query.offset = query.offset || process.env.OFFSET;
    query.sortBy = query.sortBy || process.env.SORT_BY;
    query.order = query.order || process.env.ORDER;

    return query;
  },
);
