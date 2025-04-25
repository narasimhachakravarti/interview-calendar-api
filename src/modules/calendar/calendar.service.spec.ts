// src/modules/calendar/calendar.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { Availability } from '../../database/entities/availability.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { UserRole } from '../../common/types/enum';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';

describe('CalendarService', () => {
  let service: CalendarService;
  let availabilityRepository: Repository<Availability>;
  let userRepository: Repository<User>;

  // Mock data
  const candidateId = 'candidate-id';
  const interviewer1Id = 'interviewer1-id';
  const interviewer2Id = 'interviewer2-id';

  const mockCandidate: User = {
    id: candidateId,
    name: 'Test Candidate',
    email: 'candidate@test.com',
    role: UserRole.CANDIDATE,
    password: 'hashed-password',
    availabilities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockInterviewer1: User = {
    id: interviewer1Id,
    name: 'Test Interviewer 1',
    email: 'interviewer1@test.com',
    role: UserRole.INTERVIEWER,
    password: 'hashed-password',
    availabilities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockInterviewer2: User = {
    id: interviewer2Id,
    name: 'Test Interviewer 2',
    email: 'interviewer2@test.com',
    role: UserRole.INTERVIEWER,
    password: 'hashed-password',
    availabilities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  // Common mock query builder methods
  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  });

  // Mock repositories
  const mockAvailabilityRepository = {
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockAuthService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockAvailabilityRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    availabilityRepository = module.get<Repository<Availability>>(getRepositoryToken(Availability));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAvailableSlots', () => {
    it('should return empty array when no slots match', async () => {
      // Mock candidate and interviewers existence
      mockUserRepository.findOne.mockResolvedValueOnce(mockCandidate);
      mockUserRepository.find.mockResolvedValueOnce([mockInterviewer1, mockInterviewer2]);
      
      // Mock candidate slots - 9am to 10am on 2025-05-03
      const mockCandidateQueryBuilder = createMockQueryBuilder();
      mockCandidateQueryBuilder.getMany.mockResolvedValueOnce([
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '10:00:00',
          userType: UserRole.CANDIDATE,
        }
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockCandidateQueryBuilder);
      
      // Mock interviewer availability - one interviewer is not available at the requested time
      const mockInterviewerQueryBuilder = createMockQueryBuilder();
      mockInterviewerQueryBuilder.getMany.mockResolvedValueOnce([
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer1,
        },
        // Interviewer2 is only available from 10am to 4pm
        {
          date: new Date('2025-05-03'),
          startTime: '10:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer2,
        },
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockInterviewerQueryBuilder);

      const result = await service.findAvailableSlots({
        candidateId,
        interviewerIds: [interviewer1Id, interviewer2Id],
      });

      expect(result).toEqual([]);
    });

    it('should return matching slots when all participants are available', async () => {
      // Mock candidate and interviewers existence
      mockUserRepository.findOne.mockResolvedValueOnce(mockCandidate);
      mockUserRepository.find.mockResolvedValueOnce([mockInterviewer1, mockInterviewer2]);
      
      // Mock candidate slots - 9am to 10am on 2025-05-03
      const mockCandidateQueryBuilder = createMockQueryBuilder();
      mockCandidateQueryBuilder.getMany.mockResolvedValueOnce([
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '10:00:00',
          userType: UserRole.CANDIDATE,
        }
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockCandidateQueryBuilder);
      
      // Mock interviewer availability - both interviewers are available at the requested time
      const mockInterviewerQueryBuilder = createMockQueryBuilder();
      mockInterviewerQueryBuilder.getMany.mockResolvedValueOnce([
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer1,
        },
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer2,
        },
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockInterviewerQueryBuilder);

      const result = await service.findAvailableSlots({
        candidateId,
        interviewerIds: [interviewer1Id, interviewer2Id],
      });

      expect(result).toEqual([
        {
          date: '2025-05-03',
          startTime: '09:00:00',
          endTime: '10:00:00',
        },
      ]);
    });

    it('should return multiple matching slots when available', async () => {
      // Mock candidate and interviewers existence
      mockUserRepository.findOne.mockResolvedValueOnce(mockCandidate);
      mockUserRepository.find.mockResolvedValueOnce([mockInterviewer1, mockInterviewer2]);
      
      // Mock candidate slots - several slots on different days
      const mockCandidateQueryBuilder = createMockQueryBuilder();
      mockCandidateQueryBuilder.getMany.mockResolvedValueOnce([
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '10:00:00',
          userType: UserRole.CANDIDATE,
        },
        {
          date: new Date('2025-05-04'),
          startTime: '09:00:00',
          endTime: '10:00:00',
          userType: UserRole.CANDIDATE,
        },
        {
          date: new Date('2025-05-05'),
          startTime: '10:00:00',
          endTime: '11:00:00',
          userType: UserRole.CANDIDATE,
        }
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockCandidateQueryBuilder);
      
      // Mock interviewer availability - both interviewers have multiple availability slots
      const mockInterviewerQueryBuilder = createMockQueryBuilder();
      mockInterviewerQueryBuilder.getMany.mockResolvedValueOnce([
        // Interviewer 1 slots
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer1,
        },
        {
          date: new Date('2025-05-04'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer1,
        },
        {
          date: new Date('2025-05-05'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer1,
        },
        // Interviewer 2 slots
        {
          date: new Date('2025-05-03'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer2,
        },
        {
          date: new Date('2025-05-04'),
          startTime: '09:00:00',
          endTime: '16:00:00',
          userType: UserRole.INTERVIEWER,
          user: mockInterviewer2,
        },
        // Interviewer 2 not available on 2025-05-05
      ]);
      mockAvailabilityRepository.createQueryBuilder.mockReturnValueOnce(mockInterviewerQueryBuilder);

      const result = await service.findAvailableSlots({
        candidateId,
        interviewerIds: [interviewer1Id, interviewer2Id],
      });

      // Should find matches for May 3 and 4, but not May 5 (interviewer 2 not available)
      expect(result).toEqual([
        {
          date: '2025-05-03',
          startTime: '09:00:00',
          endTime: '10:00:00',
        },
        {
          date: '2025-05-04',
          startTime: '09:00:00',
          endTime: '10:00:00',
        },
      ]);
    });

    it('should throw NotFoundException when candidate does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findAvailableSlots({
        candidateId: 'non-existent',
        interviewerIds: [interviewer1Id],
      })).rejects.toThrow('Candidate with ID non-existent not found');
    });

    it('should throw NotFoundException when interviewer does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockCandidate);
      mockUserRepository.find.mockResolvedValueOnce([mockInterviewer1]); // Only one interviewer found

      await expect(service.findAvailableSlots({
        candidateId,
        interviewerIds: [interviewer1Id, 'non-existent'],
      })).rejects.toThrow('One or more interviewers not found');
    });
  });
});