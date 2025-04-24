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
  import { CandidateService } from './candidates.service';
  import { CreateCandidateDto } from './dto/create-candidate.dto';
  import { CreateSlotDto } from './dto/create-slot.dto';
  
  @ApiTags('candidates')
  @Controller('candidates')
  export class CandidateController {
    constructor(private readonly candidateService: CandidateService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new candidate' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Candidate created successfully' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
    create(@Body() createCandidateDto: CreateCandidateDto) {
      return this.candidateService.create(createCandidateDto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all candidates' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all candidates' })
    findAll() {
      return this.candidateService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get candidate by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns the candidate' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' })
    findOne(@Param('id') id: string) {
      return this.candidateService.findOne(id);
    }
  
    @Post(':id/slots')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Add requested slot for a candidate' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Slot added successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Overlapping slot or invalid duration' })
    addRequestedSlot(
      @Param('id') id: string,
      @Body() createSlotDto: CreateSlotDto,
    ) {
      return this.candidateService.addRequestedSlot(id, createSlotDto);
    }
  
    @Get(':id/slots')
    @ApiOperation({ summary: 'Get all requested slots for a candidate' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns all requested slots' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate not found' })
    getRequestedSlots(@Param('id') id: string) {
      return this.candidateService.getRequestedSlots(id);
    }
  }