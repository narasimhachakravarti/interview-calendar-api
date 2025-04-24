// src/modules/candidates/candidate.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './candidates.controller';
import { CandidateService } from './candidates.service';
import { Candidate } from '../../database/entities/candidate.entity';
import { Availability } from '../../database/entities/availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, Availability])],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}