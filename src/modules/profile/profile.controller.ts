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
    try {
      await new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        })
        .transform(avatar);
      const normalizedPath = avatar.path.replace(/\\/g, '/');

      createProfileDto.avatar = normalizedPath;
    } catch (error) {
      if (
        error.response &&
        error.message.includes(
          'Validation failed (expected size is less than 1000000)',
        )
      ) {
        throw new HttpException(
          'File too large, only 1MB is allowed.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else if (
        error.response &&
        error.message.includes('Validation failed (expected type is image/*)')
      ) {
        throw new HttpException(
          'Invalid image type, only jpeg, jpg, png, gif, ico, webp are allowed.',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        throw new HttpException(
          `Invalid file type or size: ${error.message}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const created = await this.profileService.addProfilePicture(
      createProfileDto,
      user.id,
    );

    return {
      statusCode: 201,
      message: 'Post added successfully',
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
