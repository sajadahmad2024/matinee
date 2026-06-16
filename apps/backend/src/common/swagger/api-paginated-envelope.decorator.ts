import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiEnvelopeDto } from './api-envelope.dto';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

/**
 * Documents a PAGINATED list response: the standard envelope with
 * `data: { items: Model[]; pagination: PaginationDetailsDto }`.
 *
 * Use this (not `@ApiEnvelope(Model, { isArray: true })`) whenever the service returns
 * `{ items, pagination }` — otherwise the generated SDK types `data` as a bare array and
 * the real `{ items, pagination }` wrapper is lost.
 *
 *   @ApiPaginatedEnvelope(ContentResponseDto)
 */
export const ApiPaginatedEnvelope = <TModel extends Type<unknown>>(
  model: TModel,
  options: { status?: number; description?: string } = {},
) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, PaginationDetailsDto, model),
    ApiResponse({
      status: options.status ?? 200,
      description: options.description ?? '',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  items: { type: 'array', items: { $ref: getSchemaPath(model) } },
                  pagination: { $ref: getSchemaPath(PaginationDetailsDto) },
                },
              },
            },
          },
        ],
      },
    }),
  );
