import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async dashBoard(@AuthUser() user) {
    const postCounts = await this.prisma.posts.count({
      where: {
        userId: user.id,
      },
    });
    const commentCounts = await this.prisma.comments.count({
      where: {
        post: {
          userId: user.id,
        },
      },
    });

    const likeCounts = await this.prisma.likes.count({
      where: {
        post: {
          userId: user.id,
        },
      },
    });

    return {
      statusCode: 200,
      message: 'Dashboard data fetched successfully',
      commentCounts,
      postCounts,
      likeCounts
    };
  }
}
