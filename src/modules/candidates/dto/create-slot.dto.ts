// src/modules/candidates/dto/create-slot.dto.ts
import { IsString, IsNotEmpty, Matches, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({ example: '2025-05-03' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):00$/, {
    message: 'Start time must be in HH:00 format (start of hour)',
  })
  startTime: string;

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):00$/, {
    message: 'End time must be in HH:00 format (start of hour)',
  })
  endTime: string;
}