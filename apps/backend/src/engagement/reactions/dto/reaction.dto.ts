import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsUUID } from 'class-validator';

export const MAX_BATCH_REACTION_IDS = 100;

export class SetReactionDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsIn(['like', 'dislike'])
  reaction!: 'like' | 'dislike';
}

export class ReactionStateDto {
  @ApiPropertyOptional({ enum: ['like', 'dislike'], nullable: true, description: "The caller's current reaction" })
  reaction!: 'like' | 'dislike' | null;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
}

/** `?ids=a,b,c` (comma-separated) or repeated `?ids=a&ids=b`. Deduped, ≤ 100. */
export class BatchReactionsQueryDto {
  @ApiProperty({ type: String, description: `Comma-separated content ids (max ${MAX_BATCH_REACTION_IDS})`, example: '0199…,0199…' })
  @Transform(({ value }: { value: unknown }) => {
    const parts = (Array.isArray(value) ? value : [value]).flatMap((v) => String(v ?? '').split(','));
    return [...new Set(parts.map((p) => p.trim()).filter((p) => p.length > 0))];
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_BATCH_REACTION_IDS)
  @IsUUID('all', { each: true })
  ids!: string[];
}

export class BatchReactionsDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['like', 'dislike'], nullable: true },
    description: "contentId → the caller's reaction (null when none). Every requested id is present.",
    example: { '0199aaaa-0000-7000-8000-000000000001': 'like', '0199aaaa-0000-7000-8000-000000000002': null },
  })
  reactions!: Record<string, 'like' | 'dislike' | null>;
}
