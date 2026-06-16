import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

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
