// src/modules/interviewers/interviewer.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interviewer } from '../../database/entities/interviewer.entity';
import { Availability } from '../../database/entities/availability.entity';
import { CreateInterviewerDto } from './dto/create-interviewer.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UserRole } from '../../common/types/enum';

@Injectable()
export class InterviewerService {
  constructor(
    @InjectRepository(Interviewer)
    private interviewerRepository: Repository<Interviewer>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(createInterviewerDto: CreateInterviewerDto): Promise<Interviewer> {
    const existingInterviewer = await this.interviewerRepository.findOne({
      where: { email: createInterviewerDto.email },
    });

    if (existingInterviewer) {
      throw new ConflictException('Email already exists');
    }

    const interviewer = this.interviewerRepository.create(createInterviewerDto);
    return this.interviewerRepository.save(interviewer);
  }

  async findAll(): Promise<Interviewer[]> {
    return this.interviewerRepository.find({
      relations: ['availabilities'],
    });
  }

  async findOne(id: string): Promise<Interviewer> {
    const interviewer = await this.interviewerRepository.findOne({
      where: { id },
      relations: ['availabilities'],
    });

    if (!interviewer) {
      throw new NotFoundException(`Interviewer with ID ${id} not found`);
    }

    return interviewer;
  }

  async addAvailability(
    interviewerId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<Availability> {
    const interviewer = await this.findOne(interviewerId);

    // Validate that start time is before end time
    if (createAvailabilityDto.startTime >= createAvailabilityDto.endTime) {
      throw new ConflictException('Start time must be before end time');
    }

    // Check for overlapping availability
    const overlapping = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.interviewer_id = :interviewerId', { interviewerId })
      .andWhere('availability.date = :date', { date: createAvailabilityDto.date })
      .andWhere('availability.startTime < :endTime', { endTime: createAvailabilityDto.endTime })
      .andWhere('availability.endTime > :startTime', { startTime: createAvailabilityDto.startTime })
      .getOne();

    if (overlapping) {
      throw new ConflictException('This availability slot overlaps with an existing one');
    }

    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      userType: UserRole.INTERVIEWER,
      interviewer,
    });

    return this.availabilityRepository.save(availability);
  }

  async getAvailabilities(interviewerId: string): Promise<Availability[]> {
    const interviewer = await this.findOne(interviewerId);
    return this.availabilityRepository.find({
      where: { interviewer: { id: interviewer.id } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }
}

