// src/modules/interviewers/interviewer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewerController } from './interviewer.controller';
import { InterviewerService } from './interviewer.service';
import { Interviewer } from '../../database/entities/interviewer.entity';
import { Availability } from '../../database/entities/availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interviewer, Availability])],
  controllers: [InterviewerController],
  providers: [InterviewerService],
  exports: [InterviewerService],
})
export class InterviewerModule {}