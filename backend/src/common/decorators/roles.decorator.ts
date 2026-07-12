import { SetMetadata } from '@nestjs/common';
import { Role } from '@/generated/prisma/enums';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles; routes without this decorator are open to any authenticated user. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
