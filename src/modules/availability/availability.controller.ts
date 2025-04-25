// src/modules/availability/availability.controller.ts
import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    HttpStatus,
    HttpCode,
    Param,
    Query
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { AvailabilityService } from './availability.service';
  import { AddAvailabilityDto } from '../auth/dto/auth.dto';
  import { UserRole } from '../../common/types/enum';
  
  @ApiTags('availability')
  @Controller('availability')
  @ApiBearerAuth('access-token') // Add this for Swagger
  @UseGuards(JwtAuthGuard) // This secures all endpoints in this controller
  export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add availability for the authenticated user' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Availability added successfully' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Overlapping availability or invalid time format' })
    async addAvailability(
      @Request() req,
      @Body() addAvailabilityDto: AddAvailabilityDto,
    ) {
      return this.availabilityService.addAvailability(req.user.id, addAvailabilityDto);
    }
  
    @Get('my-slots')
    @ApiOperation({ summary: 'Get all availabilities for the authenticated user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all availabilities' })
    async getMyAvailabilities(@Request() req) {
      return this.availabilityService.getAvailabilitiesForUser(req.user.id);
    }
  
    @Get('candidates')
    @ApiOperation({ summary: 'Get all candidate availabilities' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all candidate availabilities' })
    async getCandidateAvailabilities() {
      return this.availabilityService.getAvailabilitiesByUserRole(UserRole.CANDIDATE);
    }
  
    @Get('interviewers')
    @ApiOperation({ summary: 'Get all interviewer availabilities' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all interviewer availabilities' })
    async getInterviewerAvailabilities() {
      return this.availabilityService.getAvailabilitiesByUserRole(UserRole.INTERVIEWER);
    }
  
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get availabilities for a specific user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all availabilities for the user' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    async getUserAvailabilities(@Param('userId') userId: string) {
      return this.availabilityService.findAvailabilitiesForUser(userId);
    }
  }