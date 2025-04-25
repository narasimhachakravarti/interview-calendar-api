import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/types/enum';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.CANDIDATE,
    description: 'Role of the user',
    default: UserRole.CANDIDATE
  })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole = UserRole.CANDIDATE;
}


export class AddAvailabilityDto {
    @ApiProperty({ example: '2025-05-03' })
    @IsNotEmpty()
    @IsString()
    date: string;
  
    @ApiProperty({ example: '09:00' })
    @IsNotEmpty()
    @IsString()
    startTime: string;
  
    @ApiProperty({ example: '16:00' })
    @IsNotEmpty()
    @IsString()
    endTime: string;
  }