import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Roles('superadmin', 'admin', 'moderator')
  async getAllRoles(): Promise<any> {
    const roles = await this.roleService.getAllRoles();

    if (roles.length === 0) {
      throw new HttpException('No roles found', HttpStatus.NOT_FOUND);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Roles fetched successfully',
      roles,
    };
  }
}
