import { ApiProperty } from '@nestjs/swagger';

/**
 * Documents the wire envelope produced by the global TransformInterceptor.
 * The `data` property is overridden per-endpoint via the `@ApiEnvelope()` decorator.
 */
export class ApiEnvelopeDto {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Success' })
  status!: string;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiProperty({ nullable: true, example: null, description: 'Error details, or null on success' })
  error!: Record<string, unknown> | null;
}
