import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'Carl' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'carl@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}