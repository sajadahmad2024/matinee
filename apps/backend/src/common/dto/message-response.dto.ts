import { ApiProperty } from '@nestjs/swagger';

/** Generic `{ message }` response envelope payload — shared across modules. */
export class MessageResponseDto {
  @ApiProperty({ example: 'Done' })
  message!: string;
}
