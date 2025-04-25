// src/modules/calendar/calendar.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService, MatchSlotsDto } from './calendar.service';
import {QuerySlotsDto} from './dto/query-slots.dto'
import { TimeSlot } from '../../common/types/time-slot.interface';

@ApiTags('calendar')
@Controller('calendar')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find available interview slots' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns matching 1-hour slots where candidate and all interviewers are available' 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Candidate or interviewer not found' })
  findAvailableSlots(@Body() matchSlotsDto: QuerySlotsDto): Promise<TimeSlot[]> {
    return this.calendarService.findAvailableSlots(matchSlotsDto);
  }
}