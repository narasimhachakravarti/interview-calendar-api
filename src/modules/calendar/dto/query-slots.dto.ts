import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuerySlotsDto {
  @ApiProperty({ example: 'uuid-of-candidate' })
  @IsUUID()
  candidateId: string;

  @ApiProperty({ example: ['uuid-of-interviewer-1', 'uuid-of-interviewer-2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  interviewerIds: string[];
}