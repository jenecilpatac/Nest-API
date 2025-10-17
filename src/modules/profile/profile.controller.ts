import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  HttpException,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { UserService } from '../user/user.service';
import { UpdatePersonalDetailsDto } from './dto/update-personal-details';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @SkipThrottle()
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @AuthUser() user,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('File is required');
    }

    const normalizedPath = avatar.path.replace(/\\/g, '/');

    const created = await this.profileService.addProfilePicture(
      { ...createProfileDto, avatar: normalizedPath },
      user.id,
    );
  }

  if (avatar.size > MAX_SIZE) {
    throw new HttpException(
      'File too large. Only 1MB is allowed.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  const normalizedPath = avatar.path.replace(/\\/g, '/');
  createProfileDto.avatar = normalizedPath;

  const created = await this.profileService.addProfilePicture(
    createProfileDto,
    user.id,
  );

  return {
    statusCode: 201,
    message: 'Profile picture uploaded successfully',
    created,
  };
}
  
  @Patch('update-bio')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async updateBio(
    @Body() updateProfileDto: UpdateProfileDto,
    @AuthUser() user,
  ) {
    const updated = await this.profileService.updateBio(
      updateProfileDto,
      user.id,
    );

    return {
      statusCode: 200,
      message: 'Bio updated successfully',
      updated,
    };
  }

  @Delete(':id')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async deleteProfilePicture(@AuthUser() user, @Param('id') id: number) {
    const deleted = await this.profileService.deleteProfilePicture(user.id, id);

    if (!deleted) {
      throw new HttpException(
        'Profile picture not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      statusCode: 200,
      message: 'Profile picture deleted successfully',
    };
  }

  @Patch('update-profile-picture/:id')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async setProfilePicture(@AuthUser() user, @Param('id') id: number) {
    const alreadySetProfile = await this.profileService.getProfilePictureById(
      user.id,
      id,
    );

    if (alreadySetProfile.isSet === true) {
      throw new HttpException(
        'This profile picture is already set.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const profileUpdate = await this.profileService.setProfilePicture(
      user.id,
      id,
    );

    if (!profileUpdate) {
      throw new HttpException(
        'Profile picture not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      statusCode: 200,
      message: 'Profile picture updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Patch('update-personal-details')
  async updatePersonalDetails(
    @Body() UpdatePersonalDetailsDto: UpdatePersonalDetailsDto,
    @AuthUser() user,
  ) {
    const updated = await this.profileService.updatePersonalDetails(
      UpdatePersonalDetailsDto,
      user.id,
    );

    return {
      statusCode: 200,
      message: 'Personal details updated successfully',
      updated,
    };
  }
}
