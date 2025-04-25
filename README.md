# Interview Calendar API

A production-ready REST API for coordinating interview schedules between candidates and interviewers. The system finds overlapping availability to suggest optimal interview time slots.

## Table of Contents

- [Features](#features)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Endpoints Overview](#endpoints-overview)
- [API Testing with Curl](#api-testing-with-curl)
- [System Architecture](#system-architecture)
- [Domain Model](#domain-model)
- [Authentication Flow](#authentication-flow)
- [Slot Matching Algorithm](#slot-matching-algorithm)
- [Technical Design Decisions](#technical-design-decisions)
## Features

- **Unified User Model**: Single entity with role-based permissions (candidate/interviewer)
- **JWT Authentication**: Secure token-based authentication system
- **Availability Management**: Add and retrieve availability slots for users
- **Smart Scheduling**: Algorithm to find matching interview slots
- **Production Ready**: Containerized with Docker for easy deployment
- **Swagger Documentation**: Interactive API documentation
- **TypeORM Integration**: Database ORM with migrations
- **Proper Validation**: Request data validation with error handling

## Running the Application

### Using Docker Compose (Recommended)

The easiest way to get started is with Docker Compose:

```bash

### Prerequisites
- Docker installed on your machine ([Download Docker](https://www.docker.com/products/docker-desktop/))

# Clone the repository
git clone https://github.com/narasimhachakravarti/interview-calendar-api
cd interview-calendar-api

# Copy environment file (optional - default settings are configured in docker-compose.yml)
cp .env.example .env

# Start the application (API and PostgreSQL)
docker compose up -d
```

This starts:
- API on http://localhost:3000/api/v1
- PostgreSQL database with persistent storage
- Swagger documentation on http://localhost:3000/api/docs

## API Documentation

```bash

The API is documented using Swagger. Access the interactive documentation at:
```
```
http://localhost:3000/api/docs
```
## Endpoints Overview

| **Module**      | **Endpoint**                    | **Method** | **Description**                         |
|------------------|----------------------------------|------------|-----------------------------------------|
| **Auth**         | `/auth/register`                | `POST`     | Register a new user                     |
|                  | `/auth/login`                   | `POST`     | Login and receive JWT token             |
|                  | `/auth/profile`                 | `GET`      | Get current user profile                |
| **Availability** | `/availability`                 | `POST`     | Add availability slot                   |
|                  | `/availability/my-slots`        | `GET`      | Get current user's slots                |
|                  | `/availability/candidates`      | `GET`      | Get all candidates' slots               |
|                  | `/availability/interviewers`    | `GET`      | Get all interviewers' slots             |
| **Calendar**     | `/calendar/available-slots`     | `POST`     | Find matching slots                     |

---



## API Testing with Curl

**Register a user (interviewer)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ines Johnson",
    "email": "ines@example.com",
    "password": "password123",
    "role": "interviewer"
  }'
```

**Register a user (candidate)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carl Smith",
    "email": "carl@example.com",
    "password": "password123",
    "role": "candidate"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ines@example.com",
    "password": "password123"
  }'
```

**Get user profile**
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Availability Management

**Add availability slot (as interviewer)**
```bash
curl -X POST http://localhost:3000/api/v1/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INTERVIEWER_TOKEN" \
  -d '{
    "date": "2025-05-03",
    "startTime": "09:00",
    "endTime": "16:00"
  }'
```

**Add availability slot (as candidate)**
```bash
curl -X POST http://localhost:3000/api/v1/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -d '{
    "date": "2025-05-03",
    "startTime": "09:00",
    "endTime": "10:00"
  }'
```

**Get your own availability slots**
```bash
curl -X GET http://localhost:3000/api/v1/availability/my-slots \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get all interviewer availabilities**
```bash
curl -X GET http://localhost:3000/api/v1/availability/interviewers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Calendar

**Find available slots**
```bash
curl -X POST http://localhost:3000/api/v1/calendar/available-slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "candidateId": "CANDIDATE_ID",
    "interviewerIds": ["INTERVIEWER_ID"]
  }'
```

## System Architecture

The Interview Calendar API follows a modern, modular architecture based on NestJS principles with clear separation of concerns and a layered architecture.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Applications                   │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                          NestJS API                          │
│  ┌─────────────┐    ┌────────────────┐    ┌───────────────┐ │
│  │ Auth Module │    │ Availability   │    │ Calendar      │ │
│  │             │    │ Module         │    │ Module        │ │
│  └─────────────┘    └────────────────┘    └───────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                       TypeORM Integration                    │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                    │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Layers

1. **Presentation Layer**: Controllers, DTOs, and validation
2. **Business Logic Layer**: Services and domain logic
3. **Data Access Layer**: Repositories and database entities

## Domain Model

The application uses a unified user model with role-based distinction:

### User Entity

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE
  })
  role: UserRole;

  @OneToMany(() => Availability, availability => availability.user)
  availabilities: Availability[];
}
```

### Availability Entity

```typescript
@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userType: UserRole;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => User, (user) => user.availabilities)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

## Authentication Flow

1. **Registration**:
   - User submits credentials and selects a role
   - System validates input and checks for existing email
   - Password is hashed using bcrypt
   - User record is created in database

2. **Login**:
   - User submits email and password
   - System validates credentials against database
   - JWT token is generated containing user ID and role
   - Token is returned to client

3. **Protected Routes**:
   - Client includes JWT token in Authorization header
   - JwtAuthGuard validates token signature and expiration
   - User identity and role are extracted from token
   - Request proceeds if authentication is successful

## Slot Matching Algorithm

The core business logic for finding available interview slots:

1. Get candidate's requested slots
2. Get all specified interviewers' availability
3. For each candidate slot:
   - Check if all interviewers are available during this time
   - If all interviewers are available, add to matching slots
4. Return sorted list of matching slots

```typescript
// Simplified algorithm
function findMatchingSlots(candidateSlots, interviewerAvailabilities, interviewerIds) {
  const matchingSlots = [];

  for (const candidateSlot of candidateSlots) {
    const allInterviewersAvailable = interviewerIds.every(interviewerId => {
      return isInterviewerAvailableDuringSlot(
        interviewerId, 
        candidateSlot, 
        interviewerAvailabilities
      );
    });

    if (allInterviewersAvailable) {
      matchingSlots.push(candidateSlot);
    }
  }

  return sortByDateAndTime(matchingSlots);
}
```

## Technical Design Decisions

1. **Unified User Model**: Single entity with role distinction for simplified authentication
2. **JWT Authentication**: Stateless API with token-based security
3. **TypeORM with PostgreSQL**: Robust relational database with ORM
4. **Containerization**: Docker setup for consistent environments
5. **Role-based Validation**: Different rules for candidates vs. interviewers