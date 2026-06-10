import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiEnvelopeDto } from './api-envelope.dto';

interface EnvelopeOptions {
  status?: number;
  isArray?: boolean;
  description?: string;
}

/**
 * Documents an endpoint's response as the standard envelope with a typed `data`
 * payload — so generated client SDKs get the real wire shape, not `any`.
 *
 *   @ApiEnvelope(UserResponseDto)
 *   @ApiEnvelope(UserResponseDto, { isArray: true, status: 200 })
 */
export const ApiEnvelope = <TModel extends Type<unknown>>(model: TModel, options: EnvelopeOptions = {}) =>
  applyDecorators(
    ApiExtraModels(ApiEnvelopeDto, model),
    ApiResponse({
      status: options.status ?? 200,
      description: options.description ?? '',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiEnvelopeDto) },
          {
            properties: {
              data: options.isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
