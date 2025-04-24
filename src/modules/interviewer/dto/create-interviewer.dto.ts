import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterviewerDto {
  @ApiProperty({ example: 'Ines' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'ines@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}