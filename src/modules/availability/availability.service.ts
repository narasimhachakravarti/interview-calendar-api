// src/modules/availability/availability.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from '../../database/entities/availability.entity';
import { User } from '../auth/entities/user.entity';
import { AddAvailabilityDto } from '../auth/dto/auth.dto';
import { UserRole } from '../../common/types/enum';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    private authService: AuthService,
  ) {}

  async addAvailability(
    userId: string,
    addAvailabilityDto: AddAvailabilityDto,
  ): Promise<Availability> {
    const user = await this.authService.findById(userId);

    // Validate that start time is before end time
    if (addAvailabilityDto.startTime >= addAvailabilityDto.endTime) {
      throw new ConflictException('Start time must be before end time');
    }

    // Validate that times are at the start of an hour
    const startMatch = addAvailabilityDto.startTime.match(/^(\d{1,2}):00$/);
    const endMatch = addAvailabilityDto.endTime.match(/^(\d{1,2}):00$/);
    
    if (!startMatch || !endMatch) {
      throw new ConflictException('Times must be at the start of an hour (HH:00)');
    }
    
    // For candidates, validate that slots are exactly 1 hour
    if (user.role === UserRole.CANDIDATE) {
      const startHour = parseInt(startMatch[1]);
      const endHour = parseInt(endMatch[1]);
      
      if (endHour - startHour !== 1) {
        throw new ConflictException('Interview slots must be exactly 1 hour for candidates');
      }
    }

    // Check for overlapping availability
    const overlapping = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.user_id = :userId', { userId })
      .andWhere('availability.date = :date', { date: addAvailabilityDto.date })
      .andWhere('availability.startTime < :endTime', { endTime: addAvailabilityDto.endTime })
      .andWhere('availability.endTime > :startTime', { startTime: addAvailabilityDto.startTime })
      .getOne();

    if (overlapping) {
      throw new ConflictException('This availability slot overlaps with an existing one');
    }

    const availability = this.availabilityRepository.create({
      ...addAvailabilityDto,
      userType: user.role,
      user,
    });

    return this.availabilityRepository.save(availability);
  }

  async getAvailabilitiesForUser(userId: string): Promise<Availability[]> {
    const user = await this.authService.findById(userId);
    
    return this.availabilityRepository.find({
      where: { user: { id: user.id } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async getAvailabilitiesByUserRole(role: UserRole): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { userType: role },
      relations: ['user'],
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findAvailabilitiesForUser(userId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }
}