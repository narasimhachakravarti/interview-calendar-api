// src/modules/calendar/calendar.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Availability } from '../../database/entities/availability.entity';
import { User } from '../auth/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../../common/types/enum';
import { TimeSlot } from '../../common/types/time-slot.interface';

export interface MatchSlotsDto {
  candidateId: string;
  interviewerIds: string[];
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async findAvailableSlots(matchSlotsDto: MatchSlotsDto): Promise<TimeSlot[]> {
    this.logger.log('Finding available slots...');
    
    // Verify candidate exists
    const candidate = await this.userRepository.findOne({
      where: { id: matchSlotsDto.candidateId, role: UserRole.CANDIDATE },
    });
    
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${matchSlotsDto.candidateId} not found`);
    }
    this.logger.log(`Found candidate: ${candidate.id} (${candidate.name})`);

    // Verify all interviewers exist
    const interviewers = await this.userRepository.find({
      where: { 
        id: In(matchSlotsDto.interviewerIds), 
        role: UserRole.INTERVIEWER 
      },
    });
    
    if (interviewers.length !== matchSlotsDto.interviewerIds.length) {
      throw new NotFoundException('One or more interviewers not found');
    }
    this.logger.log(`Found all interviewers: ${interviewers.map(i => i.name).join(', ')}`);

    // Get candidate's requested slots
    const candidateSlots = await this.availabilityRepository.createQueryBuilder('availability')
      .where('availability.user_id = :candidateId', { candidateId: matchSlotsDto.candidateId })
      .andWhere('availability.userType = :userType', { userType: UserRole.CANDIDATE })
      .getMany();
    
    this.logger.log(`Found ${candidateSlots.length} candidate slots`);
    candidateSlots.forEach(slot => {
      this.logger.log(`Candidate slot: date=${slot.date}, time=${slot.startTime}-${slot.endTime}`);
    });

    // Get all interviewers' availabilities
    const interviewerAvailabilities = await this.availabilityRepository.createQueryBuilder('availability')
      .leftJoinAndSelect('availability.user', 'user')
      .where('user.id IN (:...interviewerIds)', { interviewerIds: matchSlotsDto.interviewerIds })
      .andWhere('availability.userType = :userType', { userType: UserRole.INTERVIEWER })
      .getMany();
    
    this.logger.log(`Found ${interviewerAvailabilities.length} interviewer availabilities`);
    interviewerAvailabilities.forEach(slot => {
      this.logger.log(`Interviewer slot: interviewer=${slot.user?.name}, date=${slot.date}, time=${slot.startTime}-${slot.endTime}`);
    });

    // Find matching slots
    const matchingSlots: TimeSlot[] = [];

    for (const candidateSlot of candidateSlots) {
      const candidateDate = this.formatDate(candidateSlot.date);
      this.logger.log(`Processing candidate slot: date=${candidateDate}, time=${candidateSlot.startTime}-${candidateSlot.endTime}`);
      
      let allInterviewersAvailable = true;
      
      // Check each interviewer
      for (const interviewerId of matchSlotsDto.interviewerIds) {
        this.logger.log(`Checking availability for interviewer: ${interviewerId}`);
        
        // Find this interviewer's availabilities
        const interviewerSlots = interviewerAvailabilities.filter(
          a => a.user && a.user.id === interviewerId
        );
        
        this.logger.log(`Found ${interviewerSlots.length} slots for this interviewer`);
        
        // Check if any overlap with the candidate slot
        let interviewerAvailableForSlot = false;
        
        for (const interviewerSlot of interviewerSlots) {
          const interviewerDate = this.formatDate(interviewerSlot.date);
          
          this.logger.log(`Comparing dates: candidate=${candidateDate}, interviewer=${interviewerDate}`);
          this.logger.log(`Comparing times: candidate=${candidateSlot.startTime}-${candidateSlot.endTime}, interviewer=${interviewerSlot.startTime}-${interviewerSlot.endTime}`);
          
          // Check if dates match and times overlap
          if (
            interviewerDate === candidateDate &&
            interviewerSlot.startTime <= candidateSlot.startTime &&
            interviewerSlot.endTime >= candidateSlot.endTime
          ) {
            interviewerAvailableForSlot = true;
            this.logger.log('MATCH FOUND for this slot and interviewer!');
            break;
          }
        }
        
        if (!interviewerAvailableForSlot) {
          allInterviewersAvailable = false;
          this.logger.log(`Interviewer ${interviewerId} not available for this slot - skipping to next candidate slot`);
          break;
        }
      }
      
      if (allInterviewersAvailable) {
        this.logger.log(`All interviewers available for slot: ${candidateDate} ${candidateSlot.startTime}-${candidateSlot.endTime}`);
        matchingSlots.push({
          date: candidateDate,
          startTime: candidateSlot.startTime,
          endTime: candidateSlot.endTime
        });
      }
    }

    this.logger.log(`Found ${matchingSlots.length} matching slots in total`);
    
    return matchingSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }
  
  // Helper method to ensure consistent date format
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // If we get here, try converting to ISO string
    return new Date(date).toISOString().split('T')[0];
  }
}