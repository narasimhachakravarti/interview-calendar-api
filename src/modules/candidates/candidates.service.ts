import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../database/entities/candidate.entity';
import { Availability } from '../../database/entities/availability.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UserRole } from '../../common/types/enum';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const existingCandidate = await this.candidateRepository.findOne({
      where: { email: createCandidateDto.email },
    });

    if (existingCandidate) {
      throw new ConflictException('Email already exists');
    }

    const candidate = this.candidateRepository.create(createCandidateDto);
    return this.candidateRepository.save(candidate);
  }

  async findAll(): Promise<Candidate[]> {
    return this.candidateRepository.find({
      relations: ['requestedSlots'],
    });
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['requestedSlots'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    return candidate;
  }

  async addRequestedSlot(
    candidateId: string,
    createSlotDto: CreateSlotDto,
  ): Promise<Availability> {
    const candidate = await this.findOne(candidateId);
    
    if (createSlotDto.startTime >= createSlotDto.endTime) {
      throw new ConflictException('Start time must be before end time');
    }
  
    // Validate that times are at the start of an hour
    const startMatch = createSlotDto.startTime.match(/^(\d{1,2}):00$/);
    const endMatch = createSlotDto.endTime.match(/^(\d{1,2}):00$/);
    
    if (!startMatch || !endMatch) {
      throw new ConflictException('Times must be at the start of an hour (HH:00)');
    }
    
    // Validate that the slot is exactly 1 hour
    const startHour = parseInt(startMatch[1]);
    const endHour = parseInt(endMatch[1]);
    
    if (endHour - startHour !== 1) {
      throw new ConflictException('Interview slots must be exactly 1 hour');
    }
  

    // Check for overlapping slots
    const overlapping = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.candidate_id = :candidateId', { candidateId })
      .andWhere('availability.date = :date', { date: createSlotDto.date })
      .andWhere('availability.startTime < :endTime', { endTime: createSlotDto.endTime })
      .andWhere('availability.endTime > :startTime', { startTime: createSlotDto.startTime })
      .getOne();

    if (overlapping) {
      throw new ConflictException('This slot overlaps with an existing requested slot');
    }

    const slot = this.availabilityRepository.create({
      ...createSlotDto,
      userType: UserRole.CANDIDATE,
      candidate,
    });

    return this.availabilityRepository.save(slot);
  }

  async getRequestedSlots(candidateId: string): Promise<Availability[]> {
    const candidate = await this.findOne(candidateId);
    return this.availabilityRepository.find({
      where: { candidate: { id: candidate.id } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }
}