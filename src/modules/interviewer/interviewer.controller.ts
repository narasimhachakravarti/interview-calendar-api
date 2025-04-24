// src/modules/interviewers/interviewer.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpCode,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { InterviewerService } from './interviewer.service';
  import { CreateInterviewerDto } from './dto/create-interviewer.dto';
  import { CreateAvailabilityDto } from './dto/create-availability.dto';
  
  @ApiTags('interviewers')
  @Controller('interviewers')
  export class InterviewerController {
    constructor(private readonly interviewerService: InterviewerService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new interviewer' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Interviewer created successfully' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
    create(@Body() createInterviewerDto: CreateInterviewerDto) {
      return this.interviewerService.create(createInterviewerDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all interviewers' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all interviewers' })
    findAll() {
      return this.interviewerService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get interviewer by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns the interviewer' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Interviewer not found' })
    findOne(@Param('id') id: string) {
      return this.interviewerService.findOne(id);
    }
  
    @Post(':id/availability')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add availability for an interviewer' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Availability added successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Interviewer not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Overlapping availability' })
    addAvailability(
      @Param('id') id: string,
      @Body() createAvailabilityDto: CreateAvailabilityDto,
    ) {
      return this.interviewerService.addAvailability(id, createAvailabilityDto);
    }
  
    @Get(':id/availability')
    @ApiOperation({ summary: 'Get all availabilities for an interviewer' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all availabilities' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Interviewer not found' })
    getAvailabilities(@Param('id') id: string) {
      return this.interviewerService.getAvailabilities(id);
    }
  }