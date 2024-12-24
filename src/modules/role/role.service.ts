import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  getAllRoles() {
    return this.prisma.roles.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
