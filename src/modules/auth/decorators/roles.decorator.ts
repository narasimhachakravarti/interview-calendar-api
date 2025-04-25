import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../common/types/enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);