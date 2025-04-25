// src/modules/auth/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    OneToMany
  } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { Availability } from '../../../database/entities/availability.entity';
  import { UserRole } from '../../../common/types/enum';
  
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
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @BeforeInsert()
    async hashPassword() {
      this.password = await bcrypt.hash(this.password, 10);
    }
  
    async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password);
    }
  }